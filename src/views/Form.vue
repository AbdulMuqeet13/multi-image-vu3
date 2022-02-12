<template>
  <div class="home">
    <form @submit.prevent="uploadForm">
      <MultiImagePicker bgColor="black" borderColor="blue" textColor="white" liveImageURL="http://192.168.202.90:3000/uploads/" deleteURL="http://192.168.202.90:3000/delete-image/" dataURL="http://192.168.202.90:3000/muqeet/" :data_id="data_id" v-model="form_data.image"/>
      <div v-if="loader" class="loader-div">
        <loader  />
      </div>
      <button type="submit">Upload Data</button>
    </form>
    
  </div>
</template>

<script>
// @ is an alias to /src
import MultiImagePicker from '@/components/MultiImagePicker'
import EventService from '@/services/EventService'
import Loader from '../components/loader.vue'

export default {
  name: 'Form',
  components: {
    MultiImagePicker,
    Loader,
  },
  data(){
    return {
      form_data: {
        name:'',
        description:'',
        type:'',
        stock:'',
        status:'',
        image: [],
      },
      loader: false,
      data_id: ''
    }
  },
  beforeCreate(){
    console.log(this.$route.params.id)
    this.data_id = this.$route.params.id
    console.log(this.data_id)
    EventService.getData(this.$route.params.id)
        .then((result) => {
              this.form_data=result.data
        }).catch((err) => {
            console.log(err)
        });
  },
  
  methods: {
    async uploadForm(){
      this.loader=true
      await EventService.uploadData(this.form_data,this.$route.params.id)
      console.log('awaitng......')
      this.loader=false
      // console.log(this.image)
    }
  }
}
</script>
<style>
.base-input{
    display: flex;
    text-align: start;
    width: 50%;
    margin: 30px auto;
    flex-direction: column;
}
button{
    background: #222;
    color: #fff;
    padding: 10px 25px;
    border-radius: 10px;
    cursor: pointer;
    margin: 10px;
}
.loader-div{
  position: fixed;
    left: 0%;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
}
</style>