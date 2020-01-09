class App {
    constructor(){
        this.$timeForm = $(`<div class="col-md-12 form-group">
                                <label for="time-line">영상 섬네일 시간</label>
                                <span id="current-time" class="pl-2 text-muted">0초</span>
                                <input type="range" id="time-line" class="mt-3" step="1" value="0" min="0" max="60">
                            </div>`)[0];

        this.$thumbnail = document.querySelector(".thumbnail");
        this.$timeView = this.$timeForm.querySelector("#current-time");
        this.$input = {
            thumbnail: document.querySelector("#thumbnail"),
            title: document.querySelector("#title"),
            description: document.querySelector("#description"),
            videoFile: document.querySelector("#video-file"),
            timeLine: this.$timeForm.querySelector("#time-line"),
        };
        this.$form = document.querySelector("#upload-form");

        this.$video = document.createElement("video");
        this.$video.width = this.$thumbnail.offsetWidth;
        this.$video.height = this.$thumbnail.offsetHeight;

        console.log(this.$video);

        this.$canvas = document.createElement("canvas");
        this.$canvas.width = this.$thumbnail.offsetWidth;
        this.$canvas.height = this.$thumbnail.offsetHeight;
        this.ctx = this.$canvas.getContext("2d");

        this.videoEvents();
        this.inputEvents();
    }

    // Events
    
    videoEvents(){
        this.$video.addEventListener("loadedmetadata", () => this.loadVideo());
    }

    inputEvents(){
        this.$input.thumbnail.addEventListener("change", e => {
            if(!e.target.files.length === 0) return;
            
            let file = e.target.files[0];

            if(!file) return;
            let ext = file.name.substr(-3, 3).toLowerCase();
            let error = "";

            
            if(ext !== "png" && ext !== "jpg") error = ".png, .jpg 확장자 파일만 업로드 가능합니다.";
            else if(file.type.substr(0, 5) !== "image") error = "이미지 포멧 파일만 업로드 가능합니다.";
            else if(file.size > 1024 * 1024) error = "이미지 썸네일은 1MB 이하까지 업로드 가능합니다.";
            
            if(error !== ""){
                alert(error);
                e.target.value = null;
                return;
            }
            else {
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.$thumbnail.style.backgroundColor = "#000";
                    this.$thumbnail.style.backgroundImage = `url(${reader.result})`;
                    this.$timeForm.remove();
                };
            }
        });

        this.$input.videoFile.addEventListener("change", e => {
            if(!e.target.files.length === 0) return;

            let file = e.target.files[0];

            if(!file) return;
            let ext = file.name.substr(-3, 3).toLowerCase();
            let error = "";
            
            if(ext !== "mp4") error = ".mp4 확장자 파일만 업로드 가능합니다.";
            else if(file.type.substr(0, 5) !== "video") error = "비디오 포멧 파일만 업로드 가능합니다.";
            else if(file.size > 1024 * 1024 * 50) error = "50MB 이하인 파일만 업로드 가능합니다.";

            if(error !== ""){
                alert(error);
                e.target.value = null;
                return;
            }
            else {
                this.$video.src = URL.createObjectURL(file);
            }
        });

        this.$input.timeLine.addEventListener("input", e => {
            this.$timeView.innerText = e.target.value + "초";
            this.$video.currentTime = e.target.value;
            this.videoToThumbnail();
        });
    }


    // 기능

    loadVideo(){
        const {timeLine} = this.$input;
        this.$thumbnail.parentElement.after(this.$timeForm);
        timeLine.max = Math.floor(this.$video.duration);
        timeLine.value = 0;

        this.$timeView.innerText = "0초";
        this.videoToThumbnail();

        this.$video.currentTime = 0;
    }

    videoToThumbnail(){
        this.ctx.drawImage(this.$video, 0, 0,  this.$video.width, this.$video.height);
        let url = this.$canvas.toDataURL("image/jpeg");
        this.$thumbnail.style.backgroundImage = `url(${url})`;
    }
}

window.onload = () => {
    const app = new App();

};