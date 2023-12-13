document.getElementById('imageInput').addEventListener('change', handleImage);

function handleImage(e) {
    const canvas = new fabric.Canvas('canvas', {
        width: 640,
        height: 640,
        selection: false,
    });

    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const fabricImg = new fabric.Image(img, {
                width: img.width,
                height: img.height,
                left: (canvas.width - img.width) / 2,
                top: (canvas.height - img.height) / 2,
                selectable: true,
            });

            fabricImg.set({
                class: 'rounded-image',
                borderColor: '#ccc',
                cornerColor: '#ccc',
                cornerSize: 10,
                transparentCorners: false,
            });

            fabric.Image.fromURL('1.png', function (fabricFrame) {
                fabricFrame.set({
                    width: canvas.width,
                    height: canvas.height,
                    selectable: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    lockScaling: true,
                });

                fabricFrame.set({
                    clipTo: function (ctx) {
                        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI);
                    },
                });

                const group = new fabric.Group([fabricFrame, fabricImg], {
                    selectable: true,
                });

                canvas.add(group);
                canvas.renderAll();
            });
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(e.target.files[0]);
}

document.getElementById('downloadButton').addEventListener('click', function () {
    const canvas = document.getElementById('canvas');
    const imageDataUrl = getTrimmedCanvasDataURL(canvas);
    const downloadLink = document.createElement('a');
    downloadLink.href = imageDataUrl;
    downloadLink.download = 'avatar.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

function getTrimmedCanvasDataURL(canvas) {
    const diameter = 640;
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const alpha = imageData.data[(y * canvas.width + x) * 4 + 3];
            if (alpha > 0) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = diameter;
    trimmedCanvas.height = diameter;
    const trimmedContext = trimmedCanvas.getContext('2d');

    trimmedContext.beginPath();
    trimmedContext.arc(diameter / 2, diameter / 2, diameter / 2, 0, 2 * Math.PI);
    trimmedContext.closePath();
    trimmedContext.clip();
    trimmedContext.drawImage(canvas, minX, minY, maxX - minX + 1, maxY - minY + 1, 0, 0, diameter, diameter);

    const frameImage = new Image();
    frameImage.src = '1.png';
    trimmedContext.drawImage(frameImage, 0, 0, diameter, diameter);

    return trimmedCanvas.toDataURL('image/png');
}
