import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ImageSlider from './ImageSlider.js'
import ImageDrop from './ImageDrop.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div className="saliency-description">
          <p> The places in an image where people look is called visual saliency. It is possible to predict where people will look in an image.
          A map of the places where people are most likely to look is called the salience map. Submit an image below to see its salience map.
          </p>
         </div>
        <div className="algorithms-description">
          <p> We use state of the art deep learning algorithms to ensure the most accurate saliency map possible </p>
         </div>
        <div className="image-drop">
          <ImageDrop urls='' />
        </div>
      </div>
    );
  }
}

export default App;
