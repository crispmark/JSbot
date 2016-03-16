import React from 'react';
import ReactDOM from 'react-dom';
import ButtonInterface from './interface.js';

//creates the main page
function createPage() {
  var header = createHeader();
  var footer = createFooter();
  return (
    <div>
      {header}
      <main>
        <canvas id="videoCanvas" width="640" height="480">
          <p>
            Please use a browser that supports the Canvas Element, like
            <a href="http://www.google.com/chrome">Chrome</a>,
            <a href="http://www.mozilla.com/firefox/">Firefox</a>,
            <a href="http://www.apple.com/safari/">Safari</a> or Internet Explorer 10
          </p>
        </canvas>
        <ButtonInterface />
      </main>
      {footer}
    </div>
  )
}

//create the header for the webpage
function createHeader() {
  return (
    <div className="header">
      <p className="title">JSbot</p>
    </div>
  )
}

//create the footer for the webpage
function createFooter() {
  return (
    <div className="footer">
        <p className="credits">Created by Philip Rajchot and Mark Crisp</p>
        <p className="credits">for decodeMTL</p>
    </div>
  )
}


// adds buttons to DOM
ReactDOM.render(createPage(), document.getElementById('container'));
