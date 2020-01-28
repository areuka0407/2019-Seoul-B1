class CaptionModify {
    constructor(video_id, modify_selector){
        this.video_id = video_id;
        this.segmentOfImages = 8;

        this.$loading = document.createElement("div");
        this.$loading.id = "loading";
        this.$loading.innerHTML = `<i class="fa-6x fas fa-spinner fa-spin"></i>`;

        this.$root = document.querySelector(modify_selector);
        this.$sceneLine = this.$root.querySelector(".scene-line");
        this.$voiceLine = this.$root.querySelector(".voice-line");
        this.$v_canvas = this.$voiceLine.querySelector("canvas");
        this.$v_canvas.width = this.$voiceLine.offsetWidth;
        this.$v_canvas.height = this.$voiceLine.offsetHeight;

        this.$viewport = this.$root.querySelector(".viewport");
        this.$inputLine = this.$root.querySelector(".input-line");
        this.$startTime = this.$root.querySelector("#start-time");
        this.$endTime = this.$root.querySelector("#end-time");
        this.$captionInput = this.$root.querySelector("#caption-input");
        this.$caption = this.$root.querySelector("#caption");

        this.$video = this.$root.querySelector("video");
        this.$video.width = this.$viewport.offsetWidth;
        this.$video.height = this.$viewport.offsetHeight - this.$inputLine.offsetHeight;

        this.loadData().then(() => {
            this.inputEvent();
        }); 
    }

    async loadData(){
        document.body.append(this.$loading); // 로딩 아이콘 Show

        this.videoData = await this.loadVideoData();
        this.loadScene();
        this.loadVoiceData();
    }
    loadVideoData(){
        return new Promise(res => {
            let videoData = data.videos.find(x => x.idx == this.video_id);
            this.$video.src = "/video/" + videoData.video;
            this.$video.onloadedmetadata = () => res(videoData);
        });
    }
    loadScene(){
        return new Promise(res => {
            this.$sceneLine.innerHTML = "";

            let timeUnit = this.$video.duration / (this.segmentOfImages - 1);
            let iw = this.$sceneLine.offsetWidth / this.segmentOfImages;

            let canvas = document.createElement("canvas");
            canvas.width = this.$video.width;
            canvas.height = this.$video.height;
            let ctx = canvas.getContext("2d");

            let video = document.createElement("video");
            video.width = this.$video.width;
            video.height = this.$video.height;
            
            video.src = "video/" + this.videoData.video;
        
            video.onloadedmetadata = async () => {
                for(let i = 0; i < this.segmentOfImages; i++){
                    await (() => new Promise(res => {
                        video.currentTime = timeUnit * i;
                        setTimeout(() => loadImage.apply(this, [res]), 500);
                        
                    }))();
                }
                res();
            }

            function loadImage(res){
                ctx.drawImage(video, 0, 0, this.$video.width, this.$video.height);
                let image = new Image();
                image.width = iw;
                image.height = 100;
                image.src = canvas.toDataURL("image/jpeg");
                this.$sceneLine.append(image);
                res();
            }
        });
    }
    loadVoiceData(){
        const audioCtx = new AudioContext();

        const loadBuffer = new Promise(res => {
            // 영상을 array buffer로 읽은 뒤 반환한다.
            let xhr = new XMLHttpRequest();
            xhr.responseType = "arraybuffer";
            xhr.open("GET", this.$video.src);
            xhr.send();
            xhr.onload = () => res(xhr.response);
        })

        loadBuffer.then((videoData) => audioCtx.decodeAudioData(videoData))
                .then(audioData => {
                    const offscreen = this.$v_canvas.transferControlToOffscreen();
                    const channel = audioData.getChannelData(0);
                    const worker = new Worker("/js/rendering-worker.js");
                    worker.postMessage({canvas: offscreen, data: channel}, [offscreen]);
                    worker.onmessage = (e) => {
                        this.$loading.remove(); // 로딩 아이콘 Hide
                    };
                });
    }


    inputEvent(){
        this.$startTime.addEventListener("input", e => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
        });
    }
}