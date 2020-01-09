String.prototype.toSecond = function(){
    let secExp = /(?<min>[0-9]{2}):(?<sec>[0-9]{2}).(?<msec>[0-9]{2})/;
    let matches = this.match(secExp).groups;

    let result = 0;
    result += matches.min * 60;
    result += parseInt(matches.sec);
    result += parseFloat("0." + matches.msec);
    return result;
}

class Player {
    constructor(src, caption = ""){
        this.$root = document.querySelector(".video-player");
        this.$video = this.$root.querySelector("video");
        this.$video.src = src;
        this.$video.volume = 0.5;
        this.$caption = this.$root.querySelector(".caption");
        this.captionList = this.readCaption(caption);
        this.show_caption = false;
        
        this.$video.onloadedmetadata = () => {
            this.$buttons = {
                play: this.$root.querySelector("#play-btn"),
                pause: this.$root.querySelector("#pause-btn"),
                stop: this.$root.querySelector("#stop-btn"),
                caption: this.$root.querySelector("#caption-btn"),
                full: this.$root.querySelector("#full-btn")
            };

            this.timeLine = new Range("#time-line");
            this.timeLine.max = this.$video.duration;

            this.volume = new Range("#volume");
            this.volume.max = 1;
            
            this.buttonEvent();
            this.rangeEvent();
            this.frame();
        }
    }

    buttonEvent(){
        this.$root.addEventListener("dblclick", () => this.$video.paused ?  this.play() : this.pause());
        this.$buttons.play.addEventListener("click", () => this.play());
        this.$buttons.pause.addEventListener("click", () => this.pause());
        this.$buttons.stop.addEventListener("click", () => this.stop());
        this.$buttons.full.addEventListener("click", () => this.fullscreen());
        this.$buttons.caption.addEventListener("click", () => {
            this.show_caption = !this.show_caption;
            this.$buttons.caption.classList.toggle("muted");
        });
    }

    rangeEvent(){
        this.timeLine.$root.addEventListener("change", () => {
            this.$video.currentTime = this.timeLine.value;
        });
        this.volume.$root.addEventListener("change", () => {
            this.$video.volume = this.volume.value;
        });
    }

    frame(){
        const {currentTime} = this.$video;
        this.timeLine.value = currentTime;

        if(this.show_caption) {
            let showList = this.captionList.filter(x => x.startTime <= currentTime && currentTime <= x.endTime);
            this.$caption.innerHTML = showList.map(x => x.text).join("<br>");

            showList.length > 0 ? this.$caption.classList.remove("hidden") : this.$caption.classList.add("hidden");
        }
        else this.$caption.classList.add("hidden");

        requestAnimationFrame(() => {
            this.frame();
        });
    }

    play(){
        if(this.$video.currentTime === this.$video.duration) this.$video.currentTime = 0;
        this.$buttons.pause.classList.remove("hidden");
        this.$buttons.play.classList.add("hidden");
        this.$video.play();
    }
    pause(){
        this.$buttons.pause.classList.add("hidden");
        this.$buttons.play.classList.remove("hidden");
        this.$video.pause();
    }
    stop(){
        this.$video.currentTime = 0;
        this.pause();
    }

    fullscreen(){
        let target = this.$root;

        this.$buttons.full.classList.toggle("muted");
        if(document.fullscreenElement) document.exitFullscreen();
        else target.requestFullscreen();
        
    }

    readCaption(text){
        let result = [];
        let captionExp = /(?<time>[0-9]{2}:[0-9]{2}\.[0-9]{2} ~ [0-9]{2}:[0-9]{2}\.[0-9]{2})\s(?<text>.+)/;

        let matches;
        while(matches = text.match(captionExp)){
            let {groups} = matches;

            //time
            let split = groups.time.split(" ~ ");
            groups.startTime = split[0].toSecond();
            groups.endTime = split[1].toSecond();

            //text
            groups.text = groups.text.trim();

            //push
            result.push(groups);
            text = text.substr(matches[0].length + matches[1].length);
        }

        return result;
    }
}