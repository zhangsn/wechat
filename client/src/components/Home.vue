<template>
      <v-layout>
        <v-flex>
        <v-toolbar color="indigo" dark fixed app>
          <v-icon>home</v-icon>
          <v-toolbar-title>Home</v-toolbar-title>
        </v-toolbar>
        <v-dialog v-model="dialog" max-width="500px">
          <v-btn slot="activator" color="primary" dark class="mb-2">新建订阅源</v-btn>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs10 sm2 md4>
                    <v-text-field v-model="editedItem.name" label="订阅号名称"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.biz" label="ID"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
              <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-data-table
          :headers="headers"
          :items="subscribes"
          hide-actions
          :loading="loading"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td @click="navigateDetail(props.item)">{{props.item.name}}</td>
            <td class="text-xs-left">{{ props.item.biz }}</td>
            <td class="justify-center layout px-0">
              <v-btn icon class="mx-0" @click="editItem(props.item)">
                <v-icon color="teal">mdi-database</v-icon>
              </v-btn>
              <v-btn icon class="mx-0" @click="deleteItem(props.item)">
                <v-icon color="pink">delete</v-icon>
              </v-btn>
            </td>
          </template>
          <template slot="no-data">
            <v-btn color="primary" @click="initialize">Reset</v-btn>
          </template>
        </v-data-table>
        </v-flex>
      </v-layout>
</template>

<script>
export default {
  name: 'Home',
  data: () => ({
    dialog: false,
    headers: [
      { text: '订阅号名称', value: 'name' },
      { text: 'ID', value: 'biz' },
      { text: '操作', value: 'name', sortable: false,align: 'center' }
    ],
    subscribes: [],
    loading:false,
    editedIndex: -1,
    editedItem: {
      name: '',
      biz:''
    },
    defaultItem: {
      name: '',
      biz:''
    }
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? '新建订阅源' : '编辑订阅源'
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    initialize () {
      this.loading = true;
      fetch("http://localhost:5000/subscribe/get")
      .then(response=>response.json())
      .then(json=>{
        this.subscribes = json.subscribes;
        this.loading = false;
      })
    },
    navigateDetail(item){
      this.$router.push({name:'Detail',params:{item}})
    },
    editItem (item) {
      this.editedIndex = this.subscribes.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      const index = this.subscribes.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.subscribes.splice(index, 1)
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.subscribes[this.editedIndex], this.editedItem)
      } else {
        this.subscribes.push(this.editedItem)
      }
      this.close()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
