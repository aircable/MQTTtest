import { Component, Output, Input, ViewChild, EventEmitter } from '@angular/core';

const POUCH = [
    {
        START: "mousedown",
        MOVE: "mousemove",
        STOP: "mouseup"
    },
    {
        START: "touchstart",
        MOVE: "touchmove",
        STOP: "touchend"
    }
];

@Component({
    selector: 'color-picker',
    templateUrl: 'color-picker.html'
})
export class ColorPickerComponent {

    @Input() hexColor:string;

    @Output() colorChanged = new EventEmitter<String>();

    // this is the main palette
    @ViewChild("palette") palette;

    // this is the color chooser
    @ViewChild("chooser") chooser;

    ctxPalette:CanvasRenderingContext2D;

    requestAnimationFrameID:number;

    color:string;

    colorFromChooser:string;

    paletteX:number;

    paletteY:number;

    chooserX:number;

    constructor() {}

    public ngAfterViewInit() {

        console.log('Hello ColorPickerComponent Component');

        if (this.hexColor) {
            this.colorFromChooser = this.hexColor;
        } else {
            this.colorFromChooser = "#0000FF";
        }
        this.init();
    }

    init() {
        //this.initChooser();
        this.initPalette();
    }

    drawSelector(ctx:CanvasRenderingContext2D, x:number, y:number) {
        this.drawPalette(this.colorFromChooser);
        ctx.beginPath();
        ctx.arc(x, y, 10 * this.getPixelRatio(ctx), 0, 2 * Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
    }


    initPalette() {
        let canvasPalette = this.palette.nativeElement;
        this.ctxPalette = canvasPalette.getContext("2d");

        var currentWidth = window.innerWidth;

        var pixelRatio = this.getPixelRatio(this.ctxPalette);

        var width = currentWidth * 85 / 100;
        var height = width * 0.75;
        //var height = width;

        this.ctxPalette.canvas.width = width * pixelRatio;
        this.ctxPalette.canvas.height = height * pixelRatio;

        this.ctxPalette.canvas.style.width = width + "px";
        this.ctxPalette.canvas.style.height = height + "px";

        this.drawPalette(this.colorFromChooser);

        // function for dragging
        var eventChangeColorDOWN = (event) => {
            this.updateColorDOWN(event, canvasPalette, this.ctxPalette);
            this.drawSelector(this.ctxPalette, this.paletteX, this.paletteY);
        };

        POUCH.forEach(pouch => {
            canvasPalette.addEventListener(pouch.START, (event) => {
                this.drawPalette(this.colorFromChooser);
                // add move event listener
                //canvasPalette.addEventListener(pouch.MOVE, eventChangeColorDOWN);
                this.updateColorDOWN(event, canvasPalette, this.ctxPalette);
                // draw the circle
                this.drawSelector(this.ctxPalette, this.paletteX, this.paletteY);
            });

            canvasPalette.addEventListener(pouch.STOP, (event) => {
                // remove event listener
                //canvasPalette.removeEventListener(pouch.MOVE, eventChangeColorDOWN);
                // mouse up event
                this.updateColorUP(event, canvasPalette, this.ctxPalette);
                // draw the circle depending of status
                this.drawSelector(this.ctxPalette, -10, -10);
            });
        })
    }

    drawPalette(endColor:string) {

        this.ctxPalette.clearRect(0, 0, this.ctxPalette.canvas.width, this.ctxPalette.canvas.height);

        var gradient = this.ctxPalette.createLinearGradient(0, this.ctxPalette.canvas.width, this.ctxPalette.canvas.width, 0);

        // Create color gradient
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(1, endColor);

        // Apply gradient to canvas
        this.ctxPalette.fillStyle = gradient;
        this.ctxPalette.fillRect(0, 0, this.ctxPalette.canvas.width, this.ctxPalette.canvas.height);

        // Create semi transparent gradient (white -> trans. -> black)
        //gradient = this.ctxPalette.createLinearGradient(0, 0, this.ctxPalette.canvas.width, this.ctxPalette.canvas.height);
        //gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        //gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        //gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
        //gradient.addColorStop(1, "rgba(0,     0,   0, 0)");

        // Apply gradient to canvas
        //this.ctxPalette.fillStyle = gradient;
        //this.ctxPalette.fillRect(0, 0, this.ctxPalette.canvas.width, this.ctxPalette.canvas.height);
    }




    getPixelRatio(ctx) {
        var dpr = window.devicePixelRatio || 1;

        var bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;

        return dpr / bsr;
    }

    updateColorChooser(event, canvas, context) {
        this.color = this.colorFromChooser = this.getColor(event, canvas, context, true);
        this.colorChanged.emit(this.color);
        this.drawPalette(this.color);
    }

    updateColorUP(event, canvas, context) {
        this.color = this.getColor(event, canvas, context, false);
        this.colorChanged.emit( this.color + " UP" );
    }

    updateColorDOWN(event, canvas, context) {
        this.color = this.getColor(event, canvas, context, false);
        this.colorChanged.emit( this.color + " DOWN" );
    }

    getColor(event, canvas, context, fromChooser:boolean):string {

        var bounding = canvas.getBoundingClientRect(),
            touchX = event.pageX || event.changedTouches[0].pageX || event.changedTouches[0].screenX,
            touchY = event.pageY || event.changedTouches[0].pageY || event.changedTouches[0].screenX;

        var x = (touchX - bounding.left) * this.getPixelRatio(context);
        var y = (touchY - bounding.top) * this.getPixelRatio(context);

        if (fromChooser) {
            this.chooserX = x;
        } else {
            this.paletteX = x;
            this.paletteY = y;
        }
        //console.log( "touch x"+x+" y"+y);
        //var imageData = context.getImageData(x, y, 1, 1);
        let myx = (this.float2int(( x / this.ctxPalette.canvas.width ) * 11));
        if( myx > 10 ) myx = 10;
        let pmyx = "";
        if( myx < 10 ) pmyx = "0" + myx; else pmyx = "10";

        let myy = (10 - this.float2int(( y / this.ctxPalette.canvas.height ) * 11));
        if( myy > 10 ) myy = 10;
        let pmyy = "";
        if( myy < 10 ) pmyy = "0" + myy; else pmyy = "10";

        return "X" + pmyx + "Y" + pmyy;

        /*

        var red = imageData.data[0];
        var green = imageData.data[1];
        var blue = imageData.data[2];
        return "#" + this.toHex(red) + this.toHex(green) + this.toHex(blue);
 */
    }

    // faster than Math.floor()
    float2int( value ) {
        return value | 0;
    }

    toHex(n) {
        n = parseInt(n, 10);
        if (isNaN(n)) return "00";
        n = Math.max(0, Math.min(n, 255));
        return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
    }
}