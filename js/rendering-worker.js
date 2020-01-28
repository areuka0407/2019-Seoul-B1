self.onmessage = async function(e){
    const {canvas, data} = e.data;
    const ctx = canvas.getContext("2d");                
    const half = canvas.height / 2;

    // 한 픽셀당 포함될 데이터의 양 = 스텝
    const step = Math.ceil(data.length / canvas.width);  
    // Pixel Per Frame;
    const PPF = 5;                                      

    // 현재 어디까지 그렸는 지
    let currentDraw = 0;

    requestAnimationFrame(render);    

    function render(){
        // 현재 프레임에서 몇 픽셀까지 그릴지 (캔버스 크기보다 픽셀 수가 넘어가지 않도록 해야 한다.)
        let stopPixel = Math.min(currentDraw + PPF, canvas.width);

        for(; currentDraw < stopPixel; currentDraw++){
            // 스텝 단위로 순회하면서 최대값과 최소값을 구해야한다.
            let min = 1;
            let max = -1;
            for(let i = currentDraw; i < currentDraw + step; i++){
                let val = data[currentDraw * step + i];
                min = Math.min(min, val);
                max = Math.max(max, val);
            }

            // 구한 값으로 최소 1px이 되도록 사각형을 그린다.
            let H = Math.max(1, (max - min) * half);
            let Y = half - H / 2;
            ctx.fillRect(currentDraw, Y, 1, H);
        }
        if(currentDraw < canvas.width){
            requestAnimationFrame(render);
        }
        else {
            postMessage("DRAW END");
        }
    }
}