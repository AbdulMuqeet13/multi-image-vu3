import axios from 'axios'
const apiClient = axios.create({
  baseURL: 'http://192.168.202.90:3000/',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})


export default{
    async uploadData(data,id){
      // console.log(data)
      let formdata = new FormData()
      for (let i=0; i<data.image.length; i++) {
        if (!data.image.path) {
          formdata.append('image',data.image[i])  
        }
      }
      // console.log(formdata)
      // console.log(formdata)
       await apiClient.post('/save-images',formdata)
       .then((result) => {
        for (let i = 0; i < result.data.length; i++) {
          data.image.pop()           
        }
         console.log('image upload result',result)
        result.data.forEach(element => {
          data.image.push(element)
        });
        console.log('image append elements',data.image)
       }).catch((err) => {
         console.log(err)
       });
      return apiClient.patch('/muqeet/'+id, data)
    },
    getData(id){
      return apiClient.get('/muqeet/'+id)
    },
    // delete(id,name){
    //   return apiClient.delete('/muqeet/'+id)
    // }
}