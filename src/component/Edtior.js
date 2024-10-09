import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Quill from "quill";
import QuillBetterTable from "quill-better-table";
Quill.register({
  'modules/better-table': QuillBetterTable
}, true)
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],

  [{ 'header': 1 }, { 'header': 2 }],               
  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],     
  [{ 'indent': '-1'}, { 'indent': '+1' }],         
  [{ 'direction': 'rtl' }],                       

  [{ 'size': ['small', false, 'large', 'huge'] }],  
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],         
  [{ 'font': [] }],
  [{ 'align': [] }],

  ['clean']                                         
];

const Editor = forwardRef(
  ({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
  
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });


    useEffect(() => {
      ref.current?.enable(!readOnly);
    }, [ref, readOnly]);

    useEffect(() => {
      
      const container = containerRef.current;
      let containerDiv = container.ownerDocument.createElement('div');
      containerDiv.setAttribute("id", "editorDiv")
      const editorContainer = container.appendChild(
        containerDiv
      );

      const options = {
        modules: {
          toolbar: toolbarOptions,
          table : false,
          'better-table' : {
            operationMenu: {
              items: {
                unmergeCells: {
                  text: 'Another unmerge cells name'
                }
              },
              color: {
                colors: ['green', 'red', 'yellow', 'blue', 'white', 'gray'],
                text: 'Background Colors:'
              }
            }
          }
        },
        theme: 'snow'
      };

      const quill = new Quill(editorContainer, options);

      ref.current = quill;

      let tableModule = quill.getModule('better-table')
      
      if(document.body.querySelector('#insert-table') !== null){
        document.body.querySelector('#insert-table')
          .onclick = () => {
            tableModule.insertTable(3, 3)
          }
      }


      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        ref.current = null;
        container.innerHTML = '';
      };
    }, [ref]);

    return <div ref={containerRef}>

    </div>;
  },
);

function updateDeltaView (quill) {
  document.body.querySelector('#delta-view')
    .innerHTML = JSON.stringify(
      quill.getContents()
    )
}


Editor.displayName = 'Editor';

export default Editor;