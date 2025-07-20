<div align="center">
    <img width="96" src="./assets/logo.svg"/>
    <br/>
    <h1>
        jpx<br/>A javascript image processing toolkit
    </h1>
    <br/>
    <a href="https://dooxe.github.io/jpx/">DEMO</a> | 
    <a href="https://dooxe.github.io/jpx/api/">API Docs</a>
</div>
<br/><br/>

This package is highly inspired from the great [CImg](https://cimg.eu) library.

## Get started 

```typescript 
import * as jpx from '@dx/jpx';

const myImage = new jpx.Image(512,512,3);
myImage.fill(255);

const canvas = document.querySelector('#canvas');
myImage.output(canvas);
```