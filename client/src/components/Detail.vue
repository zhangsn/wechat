<template>
      <v-layout>
        <v-flex xs8 col>
        <v-toolbar color="indigo" dark fixed app>
          <v-btn @click="back" icon>
              <v-icon>arrow_back</v-icon>
            </v-btn>
          <v-toolbar-title>{{$route.params.item.name}}</v-toolbar-title>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="articles"
          hide-actions
          :loading="loading"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td class="text-xs-left"><a :href="props.item.url" target="_blank">{{props.item.title}}</a></td>
            <td class="text-xs-left">{{ props.item.likes }}</td>
            <td class="text-xs-left">{{ props.item.comments }}</td>
            <td class="text-xs-left">{{_formate(props.item.time)}}</td>
            <td class="justify-center layout px-0">
              <v-btn icon class="mx-0" @click="previewItem(props.item)">
                <v-icon color="teal">pageview</v-icon>
              </v-btn>
              <v-btn icon class="mx-0" @click="deleteItem(props.item)">
                <v-icon color="pink">delete</v-icon>
              </v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs4>
        <div class="phone">
          <iframe id="iframe" />
        </div>
      </v-flex>
      </v-layout>
</template>

<script>
export default {
  name: 'Detail',
  data: () => ({
    headers: [
      { text: '标题', value: 'title' },
      { text: '点赞数', value: 'likes' },
      { text: '评论数', value: 'comments' },
      { text: '时间', value: 'time' },
      { text: '操作', value: 'time',sortable: false ,align:'center'}
    ],
    articles: [],
    loading:false,
  }),

  created () {
    this.initialize()
  },
  methods: {
    initialize () {
      this.loading = true;
      fetch("http://localhost:5000/article/list?biz="+this.$route.params.item.biz)
      .then(response=>response.json())
      .then(json=>{
        this.articles = json.articles;
        this.loading = false;
      })
    },
    _formate(date){
      var dateFormat = require('dateformat');
      return dateFormat(date, "yyyy-mm-dd")
    },
    back(){
      this.$router.go(-1)
    },
    previewItem(item){
      var iframe = document.getElementById('iframe');
      iframe.contentDocument.documentElement.innerHTML=item.content;
      iframe.contentWindow.scrollTo(0,0);
    },
    deleteItem (item) {
      const index = this.articles.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.articles.splice(index, 1)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.phone{
    margin: 0 auto;
    background:url("../assets/phone.png") no-repeat;
    background-size: 100%;
    width: 373px;
    height: 760px;
    padding: 78px 15px;
    padding-bottom: 75px;
    position: sticky;
    top:80px;
}
.phone iframe{
  border:none;
  width:100%;
  height:100%;
}
</style>
