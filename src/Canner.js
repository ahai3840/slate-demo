
import React from 'react';
import { Value, Text } from 'slate';
import CannerEditor from 'canner-slate-editor';
import Undo from '@canner/slate-icon-undo';
import Redo from '@canner/slate-icon-redo';
import { OlList, UlList } from '@canner/slate-icon-list';
// import {Indent, Outdent} from '@canner/slate-icon-indent';
import { AlignCenter, AlignLeft, AlignRight } from '@canner/slate-icon-align';
import Table from '@canner/slate-icon-table';
// import Hr from '@canner/slate-icon-hr';
import Image from '@canner/slate-icon-image';
import Bold from '@canner/slate-icon-bold';
import Underline from '@canner/slate-icon-underline';
import { Header1, Header2, Header3 } from '@canner/slate-icon-header';
import { Button } from 'antd';
import { prop } from 'lodash/fp';
import { createTable } from 'slate-edit-table/dist/utils';
import stateToPdfMake from './state-to-pdf-make';
import { Tree }  from './image';

const font = 'SourceHanSerifCN';
const ttf = 'SourceHanSerifCN-Regular.ttf';

const menuToolbarOption = [
  { type: Undo, title: "Undo" },
  { type: Redo, title: "Redo" },
  'seperator',
  { type: Header1, title: "Header One" },
  { type: Header2, title: "Header Two" },
  { type: Header3, title: "Header Three" },
  { type: Bold, title: "Bold" },
  { type: Underline, title: "underline" },
  // { type: Hr, title: "Ruler" },
  'seperator',
  { type: AlignLeft, title: "Align Left" },
  { type: AlignCenter, title: "Align Center" },
  { type: AlignRight, title: "Align Right" },
  // { type: Indent, title: "Indent" },
  // { type: Outdent, title: "Outdent" },
  'seperator',
  { type: OlList, title: "Order List" },
  { type: UlList, title: "Unorder List" },
  'seperator',
  // { type: Link, title: "Link" },
  { type: Image, title: "Image" },
  // { type: CodeBlock, title: "Code Bloack" },
  { type: Table, title: "Table" },
  // 'seperator',
  // { type: FontColor, title: "Font Color" },
  // { type: FontBgColor, title: "Font Background Color" },
]

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: 'A line of text in a paragraph.',
              }
            ],
          },
        ],
      },
    ],
  },
});

const emptyValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: '',
              }
            ],
          },
        ],
      },
    ],
  },
});



class DemoEditor extends React.Component {
  // Set the initial state when the app is first constructed.
  constructor(props) {
    super(props);
    this.state = {
      value: initialValue
    };
    if (window.pdfMake) {
      window.pdfMake.fonts = {
        [font]: {
          normal: ttf,
          bold: 'SourceHanSerifCN-Bold.ttf',
          italics: ttf,
          bolditalics: ttf,
        }
      };
    }
  }
  onExport = (event) => {
    const { value } = this.state;
    console.log(value.toJS());
    const pdfmakeContents = stateToPdfMake(value.toJS());
    console.log(pdfmakeContents);
    window.pdfMake.createPdf({
      ...pdfmakeContents,
      defaultStyle: {
        font,
      },
      info: {
        title: 'Betalpha',
        author: 'Betalpha',
        keywords: 'Betalpha',
      },
    }).download('Beptalpha');
  };

  onClear = () => {
    this.setState({ value: emptyValue })
  };

  onInsertImage = () => {
    const { value } = this.state;
    const  change = value.change();
    console.log(change);
    
    const newChange = change.insertInline({
      type: 'image',
      isVoid: true,
      data: {
        src: Tree,
        width: 500,
        height: 500,
      },
    })
    .collapseToStartOfNextText()
    .focus()
    value.change().insertText('dddd').collapseToStartOfNextText().focus();
    this.setState({
       value,
    });
    this.setState({ value: prop('value')(newChange) });
    console.log(value);
  };

  onInsertTable= () => {
    const { value } = this.state;
    const  change = value.change();
    console.log(change);
    const table = createTable(
      {
        typeTable: 'table',
        typeRow: 'table_row',
        typeCell: 'table_cell',
        typeContent: 'paragraph'
      },
      5,
      50,
      (i,j)=>{
        return [Text.create({text: `Cute ${i} ${j} `})];
      },
    );
  
    
    const newChange = change.insertBlock(table).focus();
    this.setState({ value: prop('value')(newChange) });
  };


  render() {
    const { value } = this.state;
    const onChange = (change) => {
      const { value } = change;
      this.setState({ value })
    };

    return (
      <div style={{ margin: '20px' }}>
        <h1>Canner Editor to PDF </h1>
        <Button type="primary" onClick={this.onExport}>导出</Button> &nbsp;
        <Button onClick={this.onClear}>清空</Button> &nbsp;
        <Button onClick={this.onInsertImage}>插入图片</Button> &nbsp;
        <Button onClick={this.onInsertTable}>插入表格</Button>
        <br />
        <br /> 
        <CannerEditor
          value={value}
          onChange={onChange}
          menuToolbarOption={menuToolbarOption}
          placeholder="请输入内容"
          autoFocus
          galleryConfig={null}
        />
      </div>
    );
  }
}

export default DemoEditor;