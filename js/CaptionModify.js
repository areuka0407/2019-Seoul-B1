class CaptionModify {
    constructor(video_id, modify_selector){
        this.video_id = video_id;
        this.segmentOfImages = 8;

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
        this.videoData = await this.loadVideoData();
        await this.loadScene();
        await this.loadVoiceData();
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
                        video.addEventListener("seeked", () => res());
                    }))();
                }
                res();
            }
            video.onseeked = () => {
                ctx.drawImage(video, 0, 0, this.$video.width, this.$video.height);
                let image = new Image();
                image.width = iw;
                image.height = 100;
                image.src = canvas.toDataURL("image/jpeg");
                this.$sceneLine.append(image);
            }
        });
    }
    loadVoiceData(){
        return new Promise(res => {
            let ctx = this.$v_canvas.getContext("2d");
            ctx.strokeStyle = "#E19A31";
            ctx.lineWidth = 1;

            let audio_ctx = new AudioContext();
            let src = audio_ctx.createMediaElementSource(this.$video);
            let analyser = audio_ctx.createAnalyser();

            src.connect(analyser);
            src.connect(audio_ctx.destination);

            const dataLength = 256;
            analyser.fftSize = dataLength;
            let data_array = new Uint8Array(dataLength);

            let a_frame = () => {
                if(this.$video.currentTime < this.$video.duration) requestAnimationFrame(() => a_frame());
                else res();
                analyser.getByteFrequencyData(data_array);

                let x = this.$voiceLine.offsetWidth * this.$video.currentTime / this.$video.duration;
                let y = this.$voiceLine.offsetHeight * data_array.reduce((p, c) => p + c) / (256 * 100);

                ctx.beginPath();
                ctx.moveTo(x, 50 - y / 2);
                ctx.lineTo(x, 50 + y / 2);
                ctx.closePath();
                ctx.stroke();
            };

            a_frame();    
            // this.$video.volume = 0;
            this.$video.playbackRate = this.$video.duration / 10;
            this.$video.play();
        });
    }


    inputEvent(){
        this.$startTime.addEventListener("input", e => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
        });
    }
}