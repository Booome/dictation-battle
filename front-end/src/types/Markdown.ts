import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

export class Markdown {
  private readonly raw: string;
  private readonly tree: any;

  constructor(raw: string) {
    this.raw = raw;
    const processor = unified().use(remarkParse);
    this.tree = processor.parse(this.raw);
  }

  public getTree() {
    return this.tree;
  }

  public getVisibleText() {
    let result = '';
    let lastNodeWasText = false;

    visit(this.tree, (node) => {
      if (node.type === 'text') {
        result += node.value;
        lastNodeWasText = true;
      } else {
        if (lastNodeWasText) {
          result += '\n';
        }
        lastNodeWasText = false;
      }
    });

    return result.trim();
  }
}
