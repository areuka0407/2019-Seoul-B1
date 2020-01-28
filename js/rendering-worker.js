const DATA_SLICE = 10;
function sleep(delay){
    return new Promise( res => {
        setTimeout(() => {
            res();
        }, delay)
    });
}

self.onmessage = async function(e){
    let {canvas, data} = e.data;

    const HALF = canvas.height / 2;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#ED3150";
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    // moveTo
    let fv = data[0];
    let X = canvas.width * 0 / data.length;
    let Y = canvas.height * fv / HALF + HALF;
    ctx.moveTo(X, Y);
    
    // lineTo
    let length = data.length;
    for(let i = 1; i < length; i++){
        let v = data[i];
        let X = canvas.width * i / length;
        let Y = HALF * v / 1 + HALF;
        ctx.lineTo(X, Y);

        if(i % parseInt(data.length / DATA_SLICE) === 0){
            ctx.stroke();
            await sleep(1000);
        }
    }
    postMessage("그리기 종료");
}