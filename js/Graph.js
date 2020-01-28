Number.prototype.ceil10000 = function () {
    let acc = 10000;
    while (this > acc) acc += 10000;
    return acc;
};

class Graph {
    constructor(video_id, canvas_selector) {
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

    async loadData() {
        this.viewData = await this.loadViewCount();
    }

    loadViewCount() {
        return new Promise(res => {
            // 나중에 C과제때엔 AJAX로 변경
            let viewData = data.view_history
                .filter(x => x.video_idx == this.video_id)
                .map(x => {
                    x.date = new Date(x.date);
                    return x;
                });
            res(viewData);
        });
    }

    drawTemplate() {
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
        while (viewUnit > 0 && i < 10) {
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

    drawLine() {
        let height = this.height;
        let x_unit = (this.width - 150) / this.viewData.length;
        //높이와 유닛당 너비를 구하고

        let max = this.viewData.map(x => x.increase).reduce((p, c) => Math.max(p, c)).ceil10000();
        //10000단위 올림수로 최대치 구한다.

        //굳이 gettter setter를 쓸 필요는 없어보여서(클로징도 없고) 변경함.
        const viewData = this.viewData.map((item, i) => ({
            value: item.increase,
            x: x_unit * (i + 1) + 65,
            y: (height - 150) * item.increase / max + 50
        }));

        //여긴 두께와 색상영역이니 별도로 설명은 필요 없고
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.ctx.strokeStyle = "#426e27";

        //여긴 점찍는 부분이니 설명 필요 없을 듯 하고.
        viewData.forEach(item => {
            this.ctx.beginPath();
            this.ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });


        const _viewData = viewData.slice(0); //배열을 복사하고
        const numOfSegments = 16; // 세그먼트 숫자를 정한다. (점과 점 사이의 갯수)
        const tension = 0.3; // 장력? 선이 팽팽한 정도
        

        _viewData.unshift(viewData[0]);
        //복사한배열에 첫번째 원소를 하나 더 넣어준다. (그려줄때 통일성을 위해 첫번째 원소를 2개 넣어서 그림)
        _viewData.push(viewData[viewData.length - 1]);
        //마찬가지로 마지막 원소도 하나 추가해서 넣어준다. 

        let res = [];
        //복제된 1번점부터 마지막에서 1을 뺀 점까지 증가하면서 for를 돈다.
        for (let i = 1; i < _viewData.length - 2; i++) {
            //점과 점사이를 segment의 수로 나눠서 
            let t1x = (_viewData[i + 1].x - _viewData[i - 1].x) * tension;
            let t2x = (_viewData[i + 2].x - _viewData[i].x) * tension;

            let t1y = (_viewData[i + 1].y - _viewData[i - 1].y) * tension;
            let t2y = (_viewData[i + 2].y - _viewData[i].y) * tension;
            /*********************************************
             * 위의 4줄은 조절점 2개의 x,y좌표를 잡아내는 것으로 현재 점의 이전과 다음좌표의 중간점을 조절점으로 잡고
             * 현재점과 다음다음점의 중간점을 조절점으로 잡아 2개의 조절점을 만듦.
             *********************************************************************/
            for (let t = 0; t <= numOfSegments; t++) {

                let st = t / numOfSegments; //전체 세그먼트중 현재 몇번째 세그먼트를 그리는가? 
                //st를 이용해서 지금 그리고자 하는 곡선에서 0~1 사이의 위치를 찾는다.

                let c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
                let c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
                let c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
                let c4 = Math.pow(st, 3) - Math.pow(st, 2);

                let x = c1 * _viewData[i].x + c2 * _viewData[i + 1].x + c3 * t1x + c4 * t2x;
                let y = c1 * _viewData[i].y + c2 * _viewData[i + 1].y + c3 * t1y + c4 * t2y;
                /*
                    위의 6줄이 베지어 곡선 상에서 t포인트의 좌표를 찾는 수학식이다. 
                    https://en.wikipedia.org/wiki/B%C3%A9zier_curve 여기 참조할 것.
                */

                res.push(x);
                res.push(y);
            }
        }
        this.ctx.beginPath();
        this.ctx.moveTo(res[0], res[1]);
        for (let i = 2; i < res.length; i += 2) this.ctx.lineTo(res[i], res[i + 1]);
        this.ctx.stroke();
    }

    //다른 방식으로 그리는 방법
    drawLine2() {
        const ctx = this.ctx;
        let height = this.height;
        let x_unit = (this.width - 150) / this.viewData.length;
        //높이와 유닛당 너비를 구하고

        let max = this.viewData.map(x => x.increase).reduce((p, c) => Math.max(p, c)).ceil10000();
        //10000단위 올림수로 최대치 구한다.

        //굳이 gettter setter를 쓸 필요는 없어보여서(클로징도 없고) 변경함.
        const viewData = this.viewData.map((item, i) => ({
            value: item.increase,
            x: x_unit * (i + 1) + 65,
            y: (height - 150) * item.increase / max + 50
        }));

        //여긴 두께와 색상영역이니 별도로 설명은 필요 없고
        ctx.lineWidth = 2;
        ctx.fillStyle = ctx.strokeStyle = "#426e27";

        //여긴 점찍는 부분이니 설명 필요 없을 듯 하고.
        viewData.forEach(item => {
            ctx.beginPath();
            ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        
        ctx.moveTo(viewData[0].x, viewData[0].y); //시작점으로 이동
        ctx.beginPath();
        
        //조절점을 표시하기 위한 디버그 배열
        let debugPoint = [];
        viewData.unshift(viewData[0]);
        //점의 시작부터 마지막 점 직전까지 컨트롤 포인트를 구하면서 2차베지어 곡선(조절점 3개)을 그린다.
        for (let i = 0; i < viewData.length - 1; i++) {
            let xCenter = (viewData[i].x + viewData[i + 1].x) / 2;
            let yCenter = (viewData[i].y + viewData[i + 1].y) / 2;
            let cp_x1 = (xCenter + viewData[i].x) / 2;
            let cp_x2 = (xCenter + viewData[i + 1].x) / 2;
            //두 점의 중점으로 베지어를 그리고
            ctx.quadraticCurveTo(cp_x1, viewData[i].y, xCenter, yCenter); 
            debugPoint.push({x:cp_x1, y:viewData[i].y});
            //다시 그점에서 다음점으로 베지어를 그린다.
            ctx.quadraticCurveTo(cp_x2, viewData[i + 1].y, viewData[i + 1].x, viewData[i + 1].y); 
            debugPoint.push({x:cp_x2, y:viewData[i + 1].y});
        }
        ctx.stroke();
        //조절점 출력용 디버그 코드
        ctx.fillStyle = ctx.strokeStyle = "#f00";
        debugPoint.forEach(cp => {
            ctx.beginPath();
            ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        
    }
}