import * as jpx from '../src/index';

console.log(jpx);

const main = async () => {

    const image = await jpx.Image.load('Lenna.png');
    //image.fill(125);
    image.bloom();

    const htmlImage = new Image();
    htmlImage.src = image.toDataURL();
    document.body.appendChild(htmlImage);

};

main().catch((e)=>{
    console.error(e);
})
