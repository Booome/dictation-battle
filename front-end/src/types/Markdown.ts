import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

export class Markdown {
  public readonly raw: string;
  public readonly tree: any;
  public readonly text: string;
  public readonly title: string;
  public readonly content: string;

  constructor(raw: string) {
    this.raw = raw;
    const processor = unified().use(remarkParse);
    this.tree = processor.parse(this.raw);

    this.text = this.getText();
    this.title = this.text.split('\n')[0];
    this.content = this.text.split('\n').slice(1).join('\n');
  }

  private getText() {
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
