from urllib.parse import urljoin
import requests
import bs4


class EnglishOnlineCrawler:
    def __init__(self):
        self.base_url = "https://www.english-online.at"
        self.visited_urls = set()

    def crawl(self, url: str = None):
        if url is None:
            url = self.base_url

        if not url.startswith("http"):
            url = urljoin(self.base_url, url)
        if url in self.visited_urls:
            return

        self.visited_urls.add(url)
        print(f"Crawl {url} ...")

        response = requests.get(url)
        soup = bs4.BeautifulSoup(response.text, "html.parser")
        a_tags = soup.select("div.span9 li a")
        for a_tag in a_tags:
            href = a_tag.get("href")
            if href is not None:
                self.crawl(href)


def main():
    crawler = EnglishOnlineCrawler()
    crawler.crawl()


if __name__ == "__main__":
    main()
