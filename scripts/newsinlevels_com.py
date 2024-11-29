import logging
import os
import random
import re
import time
import uuid
from subprocess import check_call

import click
import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

TARGETS_DIR = 'targets'


def get_random_headers():
    ua = UserAgent()
    return {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',  # noqa: E501
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
    }


def fetch_page(url, retries=3):
    for attempt in range(retries):
        try:
            time.sleep(random.uniform(2, 5))
            response = requests.get(
                url, headers=get_random_headers(), timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except requests.exceptions.RequestException as e:
            logging.warning(f"Attempt {attempt + 1}/{retries} failed: {str(e)}")
            if attempt == retries - 1:
                logging.error(f"Unable to access {url}: {str(e)}")
                return None


def get_artical_from_url(url):
    logging.info(f"Get artical from url: {url}")

    soup = fetch_page(url)
    if not soup:
        raise RuntimeError(f"Failed to fetch page: {url}")

    main_content = soup.find('div', class_='main-content')
    if not main_content:
        raise RuntimeError(f"Failed to find main content: {url}")

    article_title = (
        main_content.find('div', class_='article-title')
        .find('h2').text.replace('– level 3', '')
        .strip()
    )
    if not article_title:
        raise RuntimeError(f"Failed to find article title: {url}")
    logging.debug(f"artical title: {article_title}")

    img_url = main_content.find('a', href=True)['href']
    if not img_url:
        raise RuntimeError(f"Failed to find img url: {url}")
    logging.debug(f"Img url: {img_url}")

    content = main_content.find('div', id="nContent").text.strip()
    if not content:
        raise RuntimeError(f"Failed to find content: {url}")
    logging.debug(f"Content: {content}")

    lines = content.splitlines()
    for index, line in enumerate(lines):
        logging.debug(f'{index}: {line}')

    if re.match(r'\d{2}-\d{2}-\d{4}', lines[0]):
        lines.pop(0)

    end_index = -1
    for index, line in enumerate(lines):
        if line.startswith('Difficult words:'):
            end_index = index
            break
    if end_index == -1:
        raise RuntimeError(f"Failed to find end index: {url}")
    lines = lines[:end_index]

    return {
        'title': article_title,
        'img_url': img_url,
        'content': lines,
    }


def get_exist_articals() -> list[str]:
    h1_contents = []

    for filename in os.listdir(TARGETS_DIR):
        if filename.endswith('.md'):
            with (
                open(os.path.join(TARGETS_DIR, filename), 'r', encoding='utf-8')
                as file
            ):
                first_line = file.readline().strip()
                if first_line.startswith('#'):
                    h1_contents.append(first_line.lstrip('# ').strip())

    return h1_contents


def save_article_as_target(artical: dict):
    unique_id = uuid.uuid4()

    text = f'# {artical["title"]}\n\n'

    text += f'![{artical["title"]}](./assets/{unique_id}.jpg)\n\n'
    check_call(
        ['wget', '-O', f'./targets/assets/{unique_id}.jpg', artical['img_url']])

    for line in artical['content'][:-1]:
        text += f'{line}\n\n'
    text += f'{artical["content"][-1]}\n'

    fpath = f'{TARGETS_DIR}/{unique_id}.md'
    logging.info(f'Save artical to {fpath}')
    with open(fpath, 'w', encoding='utf-8') as file:
        file.write(text)


@click.command()
@click.option('--start', type=int, default=1)
@click.option('--end', type=int, default=436)
def main(start: int, end: int):
    logging.basicConfig(level=logging.INFO)

    check_call('mkdir -p targets/assets', shell=True)

    exist_articals = get_exist_articals()

    for i in range(start, end):
        url = f"https://www.newsinlevels.com/level/level-3/page/{i}/"
        logging.info(f"Accessing page {i}: {url}")

        soup = fetch_page(url)
        if not soup:
            logging.error(f"Failed to fetch page: {url}")

        links = soup.find_all('a', href=True)
        for link in links:
            href = link['href']
            if not re.match(
                r'^https://www\.newsinlevels\.com/products/.*-level-3$', href
            ):
                continue

            try:
                artical = get_artical_from_url(href)
                logging.info(f"Got artical: {str(artical)[:100]}...")
            except RuntimeError as e:
                logging.error(f"Error: {e}")
                continue

            if artical['title'] in exist_articals:
                continue
            save_article_as_target(artical)


if __name__ == "__main__":
    main()
