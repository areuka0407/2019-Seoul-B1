Number.prototype.ceil10000 = function(){   
    let acc = 10000;
    while(this > acc) acc += 10000;
    return acc;
};

class Graph {
    constructor(video_id, canvas_selector){
        this.video_id = video_id;
        this.$canvas = document.querySelector(canvas_selector);
        this.width = this.$canvas.width;
        this.height = this.$canvas.height;
        this.ctx = this.$canvas.getContext("2d");

        this.loadData().then(() => {
            this.drawTemplate();
            this.drawLine();
        });
    }

    async loadData(){
        this.viewData = await this.loadViewCount();
    }
    loadViewCount(){
        return new Promise(res => {
            let viewData = data.view_history
                .filter(x => x.video_idx == this.video_id)
                .map(x => {
                    x.date = new Date(x.date);
                    return x;
                });
            res(viewData);
        });
    }

    drawTemplate(){
        this.ctx.beginPath();
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#E19A31";
        this.ctx.moveTo(100, 50);
        this.ctx.lineTo(100, this.height - 100);
        this.ctx.lineTo(this.width - 50, this.height - 100);
        this.ctx.stroke();

        
        this.ctx.fillStyle = "#202020";
        let unit = (this.width - 150) / this.viewData.length;
        this.viewData.map(x => x.date).forEach((date, i) => {
            let year = `${date.getFullYear()}년`;
            let month = `${date.getMonth() + 1}월`;
            this.ctx.font = "12px NanumSquare, sans-serif";
            this.ctx.fillText(year, 50 + unit * i + 80, this.height - 70)
            
            this.ctx.font = "20px bold NanumSquare, sans-serif";
            this.ctx.fillText(month, 50 + unit * i + (date.getMonth() < 9 ? 85 : 80), this.height - 45)
        });
        
        let max = this.viewData.map(x => x.increase).reduce((p, c) => Math.max(p, c)).ceil10000();
        let viewUnit_unit = max / 5;

        let i = 0;
        let viewUnit = max;
        this.ctx.font = "12px NanumSquare, sans-serif";
        unit = (this.height - 150) / 5;
        while(viewUnit > 0 && i < 10){
            let y = 50 + i * unit;
            let width = this.ctx.measureText(viewUnit.toLocaleString()).width;
            this.ctx.fillStyle = "#202020";
            this.ctx.fillText(viewUnit.toLocaleString(), 85 - width, y + 5);

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#e9c083";
            this.ctx.beginPath();
            this.ctx.moveTo(100, y);
            this.ctx.lineTo(this.width - 50, y);
            this.ctx.stroke();
            viewUnit -= viewUnit_unit;
            i++;
        }
    }

    drawLine(){
        let height = this.height;
        let x_unit = (this.width - 150) / this.viewData.length;
        let max = this.viewData.map(x => x.increase).reduce((p, c) => Math.max(p, c)).ceil10000();
        const viewData = this.viewData.map((item, i) => ({
            value: item.increase,
            get x(){
                return x_unit * (i + 1) + 65;
            },
            get y(){
                return (height - 150) * item.increase / max + 50;
            }
        }));
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.ctx.strokeStyle = "#426e27";
    
        viewData.forEach(item => {
            this.ctx.beginPath();
            this.ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });


        const _viewData = viewData.slice(0);
        const numOfSegments = 16;
        const tension = 0.3;
        
        _viewData.unshift(viewData[0]);
        _viewData.push(viewData[viewData.length - 1]);
        
        let res = [];
        for(let i = 1; i < _viewData.length - 2; i++){
            for(let t = 0; t <= numOfSegments; t++){
                let t1x = (_viewData[i+1].x - _viewData[i-1].x) * tension;
                let t2x = (_viewData[i+2].x - _viewData[i].x) * tension;

                let t1y = (_viewData[i+1].y - _viewData[i-1].y) * tension;
                let t2y = (_viewData[i+2].y - _viewData[i].y) * tension;

                let st = t / numOfSegments;

                let c1 =   2 * Math.pow(st, 3) 	- 3 * Math.pow(st, 2) + 1; 
                let c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2); 
                let c3 = 	   Math.pow(st, 3)	- 2 * Math.pow(st, 2) + st; 
                let c4 = 	   Math.pow(st, 3)	- 	  Math.pow(st, 2);

                let x = c1 * _viewData[i].x	+ c2 * _viewData[i+1].x + c3 * t1x + c4 * t2x;
                let y = c1 * _viewData[i].y	+ c2 * _viewData[i+1].y + c3 * t1y + c4 * t2y;

                res.push(x);
                res.push(y);
            }
        }
        this.ctx.beginPath();
        this.ctx.moveTo(res[0], res[1]);
        for(let i = 2; i < res.length; i+=2) this.ctx.lineTo(res[i], res[i+1]);
        this.ctx.stroke();
    }
}