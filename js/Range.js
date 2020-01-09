class Range {
    constructor(target){
        this.$root = document.querySelector(target);
        this.$cursor = this.$root.querySelector(".cursor");
        this.$bar = this.$root.querySelector(".progress-bar");
        
        
        this.clicked = false;

        this.max = 1;

        this.onchange = new CustomEvent("change");
        this.rangeEvents();
    }

    get width(){
        return this.$root.offsetWidth;
    }

    get value(){
        let left = this.$cursor.offsetLeft;
        return this.max * left / this.width;
    }

    set value(val){
        this.setCursor(this.width * val / this.max);
    }

    setCursor(value){
        if(typeof value === "number") value = value + "px";
        this.$cursor.style.left = value;
        this.$bar.style.width = value;
    }

    takeX(event){
        const {clientX} = event;
        let x = clientX - $(this.$root).offset().left;
        x = x < 0 ? 0 : x > this.width ? this.width : x;
        return x;
    }

    rangeEvents(){
        this.$root.addEventListener("mousedown", e => {
            if(e.which !== 1) return;
            let x = this.takeX(e);
            this.setCursor(x);
            this.$root.dispatchEvent(this.onchange);
            this.clicked = true;
        });

        this.$cursor.addEventListener("dragstart", e => {
            e.preventDefault();
        })
        window.addEventListener("mouseup", e => {
            this.clicked = false;
        });

        window.addEventListener("mousemove", e => {
            if(e.which !== 1 || !this.clicked) return;
            let x = this.takeX(e);
            this.setCursor(x);
            this.$root.dispatchEvent(this.onchange);
        });
    }
    
}