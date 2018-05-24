<template>
    <v-layout>
      <v-flex>
        <v-card>
          <v-toolbar color="indigo" dark fixed app>
            <v-toolbar-title>Task</v-toolbar-title>
          </v-toolbar>
          <v-list>
            <v-list-tile v-for="item in subscribes" :key="item.biz" avatar>
              <v-list-tile-action>
                <v-icon v-if="item.running" color="pink">star</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-text="item.name"></v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-avatar>
                <img :src="item.img">
              </v-list-tile-avatar>
            </v-list-tile>
          </v-list>
        </v-card>
        <v-btn
            fab
            color="pink"
            fixed
            left
            style="bottom:56px"
            @click.native.stop="start"
          >
          <v-icon v-if="!!runningBiz" color="white">stop</v-icon>
          <v-icon v-else color="white">play_arrow</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
</template>
<script>
export default {
    name: 'Task',
    data:() =>({
        subscribes:[],
        runningBiz:sessionStorage.getItem('runningBiz')
    }),
    created () {
        this.initialize();
    },
    mounted (){
    },
    methods: {
        initialize () {
        this.loading = true;
            fetch("http://172.20.132.192:5000/subscribe/get")
            .then(response=>response.json())
            .then(json=>{
                this.subscribes = json.subscribes.map((item)=>{
                    item.running = this.runningBiz == item.biz;
                    return item;
                })
                this._run();
                this.loading = false;
            })
        },
        start (){
            if(this.runningBiz){
                this._stop();
            }else{
                var bizs = this.subscribes.map(item=>item.biz);
                sessionStorage.setItem("bizs",JSON.stringify(bizs));
                this._run();
            }
        },
        _stop(){
            sessionStorage.removeItem('runningBiz');
            sessionStorage.removeItem('bizs');
            this.runningBiz = null;
            this.subscribes = this.subscribes.map(item=>{
                item.running = false;
                return item;
            })
        },
        _run(){
            setTimeout(()=>{
                var bizs = JSON.parse(sessionStorage.getItem("bizs")||"[]");
                if(bizs.length>0){
                    var biz = bizs.shift();
                    this.runningBiz = biz;
                    this.subscribes = this.subscribes.map(item=>{
                        item.running = item.biz == this.runningBiz;
                        return item;
                    })
                    sessionStorage.setItem("bizs",JSON.stringify(bizs));
                    sessionStorage.setItem("runningBiz",biz);
                    location.href = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz='+biz+'&scene=124&initlink#wechat_redirect';
                }else{
                    this._stop();
                }
            },Math.random()*2000+1000)
        }
    }
}
</script>