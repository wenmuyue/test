import { _decorator, Color, color, Component, EditBox, instantiate, Node, Prefab, resources, Sprite, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('main')
export class main extends Component {
    colorFive:Color[] = [
        color(255,255,0),
        color(255,0,0),
        color(0,255,0),
        color(0,0,255),
        color(255,255,255),
    ]

    start() {
        this.init()
    }

    update(deltaTime: number) {
        
    }


// 现有整型数组 a、整型数组 b、以及整型 v，请编写函数，判断是否可以从 a 中选择⼀个数，从 b 中选
// 择⼀个数，⼆者相加等于 v，如可以返回 true，否则返回 false。⽐如如下输⼊将返回 true，因为 a 中
// 40 和 b 中 2 相加为 42。代码编写完毕后，⽤⼤ O 表示法分析⼀下代码的时间复杂度。

    check(a:number[],b:number[],value:number):boolean{
        if (a.length == 0||b.length == 0){
            return false
        }
        let hash:{[key:number]:boolean} = {}
        for (const v of a) {
            hash[v] = true
        }
        for (const v of b) {
            if(hash[value-v]){
                return true
            }
        }
        return false
    }
    //时间复杂度最高为o(a.length + b.length) 即 o(n)

    init(){
        resources.load("prefab/demo",Prefab,(err,prefab)=>{
            if(prefab){
                let demo = instantiate(prefab)
                this.btnDemo(demo)
                this.node.addChild(demo)
            }else{
                console.log("加载失败"+err)
            }
        })
    }

    btnDemo(node:Node){
        let btn = node.getChildByName("btn")
        let btn_touch = btn?btn.getChildByName("btn_touch"):null
        if(btn_touch){
            let timeHalf = 0.5
            let min = 0.98
            let max = 1.02
            let action = tween(btn).to(timeHalf,{scale:new Vec3(max,min,1)}).to(timeHalf,{scale:new Vec3(min,max,1)})
            tween(btn).repeatForever(action).start() 

            btn_touch.on(Node.EventType.TOUCH_START, () => {
                let sprite = btn_touch.getComponent(Sprite)
                sprite.color = color(105,105,105)
                let base = 0.8
                tween(btn_touch).to(0.1,{scale:new Vec3(base,base,1)}).start()
                let action2 = tween(btn_touch).to(timeHalf/4,{scale:new Vec3(base*max,base*max,1)})
                .to(timeHalf/4,{scale:new Vec3(base*min,base*min,1)})
                tween(btn_touch).repeat(3,action2).start()
              }, this);
            btn_touch.on(Node.EventType.TOUCH_END, () => {
                tween(btn_touch).stop()
                let sprite = btn_touch.getComponent(Sprite)
                sprite.color = color(255,255,255)
                let base = 1
                tween(btn_touch).to(0.1,{scale:new Vec3(base,base,1)}).start()
                let action2 = tween(btn_touch).to(timeHalf/4,{scale:new Vec3(base*max,base*max,1)})
                .to(timeHalf/4,{scale:new Vec3(base*min,base*min,1)})
                tween(btn_touch).repeat(3,action2).start()
                this.refresh()
              }, this);
        }

    }

    getProbColor(top:Color|null,left:Color|null,x:number,y:number):number{
        let prob:number[] = new Array(5).fill(20)
        if(top&&left){
            let leftIndex = this.colorFive.indexOf(left)
            let topIndex = this.colorFive.indexOf(top)
            if(top==left){
                prob[leftIndex] = 20 + y
                let other = (100 - prob[leftIndex])/4
                for (let index = 0; index < 5; index++) {
                    if(index!=leftIndex){
                        prob[index] = other
                    }
                }
            }else{
                prob[leftIndex] = 20 + x
                prob[topIndex] = 20 + x
                let other = (100 - (20 + x)*2)/3
                for (let index = 0; index < 5; index++) {
                    if (index !== leftIndex && index !== topIndex){
                        prob[index] = other / 3
                    }
                }
            }
        }else if(!top&&left){
            let leftIndex = this.colorFive.indexOf(left)
            prob[leftIndex] = 20 + x;
            const other = (100 - prob[leftIndex])/4
            for (let index = 0; index < 5; index++) {
                if(index!=leftIndex){
                    prob[index] = other
                }
            }
        }
        else if(top&&!left){
            let topIndex = this.colorFive.indexOf(top)
            prob[topIndex] = 20 + x;
            const other = (100 - prob[topIndex])/4
            for (let index = 0; index < 5; index++) {
                if(index!=topIndex){
                    prob[index] = other
                }
            }
        }
        else{
            return Math.floor(Math.random()*5)
        }
        let rand = Math.random() * 100;
        let batter = 0;
        for (let index = 0; index < prob.length; index++) {
            batter = batter + prob[index]
            if (rand <= batter){
                return index
            }
        }
        return 4
    }

    refresh(){
        this.node.getChildByName("demo").getChildByName("Layout").removeAllChildren()
        let input_x = this.node.getChildByName("demo").getChildByName("input_x").getComponent(EditBox)
        let input_y = this.node.getChildByName("demo").getChildByName("input_y").getComponent(EditBox)
        let x = Number(input_x.string)
        let y = Number(input_y.string)
        if(!x){
            input_x.string = "0"
        }
        if(!y){
            input_y.string = "0"
        }
        let tips = this.node.getChildByName("demo").getChildByName("tips")
        tips.active = false
        if(x > 30){
            tips.active = true
            return
        }
        if(y > 80){
            tips.active = true
            return
        }
        if(!((x||x==0)&&(y||y==0))){
            return
        }
        let showColor: Color[][] = []
        for(let m=0; m<10; m++){
            showColor.push(new Array(10));
        }
        showColor[0][0] =  this.colorFive[Math.floor(Math.random()*5)]

        let cell = this.node.getChildByName("demo").getChildByName("cell")
        for (let m = 0; m < 10; m++) {
            for (let n = 0; n < 10; n++) {
                if (m == 0 && n == 0){
                    let clone= instantiate(cell)
                    clone.active = true
                    let sprite = clone.getComponent(Sprite)
                    sprite.color = showColor[0][0]
                    this.node.getChildByName("demo").getChildByName("Layout").addChild(clone)
                    continue
                }
                let left = n > 0 ? showColor[m][n-1] : null;
                let top = m > 0 ? showColor[m-1][n] : null;
                showColor[m][n] = this.colorFive[this.getProbColor(left, top, x, y)];
                let clone= instantiate(cell)
                clone.active = true
                let sprite = clone.getComponent(Sprite)
                sprite.color = showColor[m][n]
                this.node.getChildByName("demo").getChildByName("Layout").addChild(clone)
            }
        }
    }
}