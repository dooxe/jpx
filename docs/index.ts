import * as jpx from '../src/index';

const main = async () => {

    const image = await jpx.Image.load('Lenna.png');
    //image.fill(125);
    //image.blutify();

    const htmlImage = new Image();
    const content = document.querySelector('#content');
    htmlImage.src = image.toDataURL();
    content.appendChild(htmlImage);

    const filters = [
        {
            id: 'blutify',
            name: 'Blutify',
        },
        {
            id: 'grungy',
            name: 'Grungy',
        },
        {
            id: 'desaturate',
            name: 'Desaturate',
        },
        {
            id: 'pixelate',
            name: 'Pixelate',
            parameters: [
                10
            ]
        },
        {
            id: 'sepia',
            name: 'Sepia',
        },
        {
            id: 'brightnessContrast',
            name: 'Brightness / Contrast',
            parameters: [
                {
                    brightness: -0.2,
                    //contrast: 0.5
                }
            ]
        },
        {
            id: 'lighten',
            name: 'Lighten',
            parameters: [0.25]
        },
        {
            id: 'equalize',
            name: 'Equalize',
            parameters: []
        },
        {
            id: 'saturation',
            name: 'Saturation',
            parameters: [0.5]
        },
        {
            id: 'vintage',
            name: 'Vintage',
            parameters: []
        },
        {
            id: 'love',
            name: 'Love',
            parameters: []
        },
        {
            id: 'lightVintage',
            name: 'Light vintage',
            parameters: []
        },
        {
            id: 'bloom',
            name: 'Bloom',
            parameters: []
        }
    ];

    const links: HTMLAnchorElement[] = [];
    const menuList = document.querySelector('.menu .list');
    for (const filter of filters) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = filter.name;
        a.href = '#';
        a.onclick = () => {
            for (const l of links) {
                l.classList.remove('selected');
            }
            const fun = filter.id;
            const img = image.clone();
            img[fun].call(img, ...(filter.parameters || []));
            htmlImage.src = img.toDataURL();
            a.classList.add('selected');
        };
        links.push(a as HTMLAnchorElement);
        li.appendChild(a);
        menuList.appendChild(li);
    }


};

document.addEventListener('DOMContentLoaded', () => {
    main().catch((e) => {
        console.error(e);
    });
});
