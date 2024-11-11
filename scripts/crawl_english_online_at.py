from urllib.parse import urljoin
import requests
import bs4
import time
import random


class EnglishOnlineCrawler:
    def __init__(self):
        self.base_url = "https://www.english-online.at"
        self.visited_urls = set()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        }

    def crawl(self, url: str = None):
        if url is None:
            url = self.base_url

        if not url.startswith("http"):
            url = urljoin(self.base_url, url)
        if url in self.visited_urls:
            return

        self.visited_urls.add(url)
        print(f"Crawl {url} ...")

        try:
            time.sleep(random.uniform(1, 3))
            response = requests.get(url)
            print(f"Response: {response.text}")
            if response.status_code == 200:
                soup = bs4.BeautifulSoup(response.text, "html.parser")
                a_tags = soup.select("div.span9 li a")
                for a_tag in a_tags:
                    href = a_tag.get("href")
                    if href is not None:
                        self.crawl(href)
            else:
                print(f"Failed to fetch {url}, status code: {response.status_code}")
        except requests.RequestException as e:
            print(f"Error crawling {url}: {str(e)}")


def main():
    crawler = EnglishOnlineCrawler()
    crawler.crawl()


if __name__ == "__main__":
    main()
