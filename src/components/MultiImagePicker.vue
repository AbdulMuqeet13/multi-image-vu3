<template>
    <div 
        @dragenter.prevent="toggleActive"
        @dragleave.prevent="toggleActive"
        @dragover.prevent=""
        @drop.prevent="append_files"
    >
        <div :style="styles" class="image_list" :class="{ 'active': active }" >
            
            <p>Drag and Drop Images or <a href="#" @click="selectImage">Click Here</a> to Select</p>
            <div class="image-div" v-for="item, index in preview_list" :key="index">
                <img class="image" :src="item" />
                <div class="image_actions">
                    <i @click="expand(index)" class="fas fa-expand"></i>
                    <i @click="re_upload(index)" class="fas fa-redo-alt"></i>
                    <i @click="del_confirm(index)" class="fas fa-trash"></i>                    
                </div>
            </div>
            <div :class="{'loader': loader}"></div>
        </div>
        
    </div>
    <div v-if="del_image" class="modal-backdrop">
        <div class="modal">
            <div class="delete_images">
                <h2>Are you Sure to Delete this Item ?</h2>
                <div class="del_actions">
                    <button type="button" class="dismiss" @click.prevent="del_image=false">No</button>
                    <button type="button" class="del" @click="deleteImage">Yes</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="full_image" class="modal-backdrop">
        <div class="modal">
            <i @click="this.full_image=null" class="fas fa-times-circle"></i>
            <img class="full-image" :src="full_image" alt="">
        </div>
    </div>
    <input
      ref="re_upload"
      @change="pickFile(index_number)"
      type="file"
      style="display:none">
    <input ref="fileInput" style="display:none" type="file" accept="image/*" multiple="multiple" @change="previewMultiImage" class="form-control-file" id="my-file">
</template>

<script>
import axios from "axios";
export default {
    
    data(){
        return {
            previewImage: "https://www.slntechnologies.com/wp-content/uploads/2017/08/ef3-placeholder-image.jpg",
            image: '',
            image_list: [],
            preview_list: [],
            index_number: 0,
            active: false,
            full_image: null,
            del_image: false,
            loader: false,
            liveImageName: [],
            live_image: false,
            formdata: null
        }
    },
    props: {
        modelValue: null,
        dropped: null,
        liveUpload: {
            type: Boolean,
            default: false
        },
        //live upload links
        liveURL: '',
        postRoute: '',
        getRoute: '',
        delURL: '',
        //images from live server
        liveImageURL: '',
        dataURL: '',
        data_id: '',
        deleteURL: '',
        bgColor:{
            type: String,
            default: ''
        },
        textColor:{
            type: String,
            default: ''
        },
        borderColor:{
            type: String,
            default: ''
        }
    },
    computed: {
        styles(){
            return {
                "background-color": this.bgColor,
                "color": this.textColor,
                "border-color": this.borderColor,
            }
        }
    },
    async beforeCreate() {
        var local =null
        this.loader=true
        await axios.get(this.dataURL+this.data_id)
            .then((result)=>{
                result.data[0].image.forEach(elem=>{
                    this.image_list.push(elem)
                })
                local= result
                var image = local.data[0].image
                this.formdata = local
                let length=local.data[0].image.length
                for (let i = 0; i < length; i++) {
                    this.liveImageName.push(local.data[0].image[i].name) 
                    image[i]=this.liveImageURL+local.data[0].image[i].name
                }
                this.preview_list=image
                this.loader=false
            })
    },
    methods: {
        selectImage () {
          this.$refs.fileInput.click()
        },
        async previewMultiImage(event, dataTransfer) {
            this.previewImage=''
            var input = null;
            if (dataTransfer) {
                input = dataTransfer
            } else {
                input = event.target
            }
            // console.log('tag', input.files)
            var count = input.files.length;
            var index = 0;
            if (input.files) {
                while(count --) {
                var reader = new FileReader();
                
                if (this.liveUpload) {
                    this.loader=true
                    const apiClient = axios.create({
                    baseURL: this.liveURL,
                    withCredentials: false,
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    }
                    })
                    const formData = new FormData()
                    formData.append('image',input.files[index])
                    await apiClient.post(this.postRoute, formData)
                        .then((result) => {
                            this.loader=false
                            this.preview_list.push(this.liveURL+this.getRoute+result.data.name)
                            this.image_list.push(result.data.name)
                            console.log(this.image_list)
                        }).catch((err) => {
                            this.loader=false
                            console.log(err)
                        });
                } else {
                    reader.onload = (e) => {
                    this.preview_list.push(e.target.result);
                    }
                    this.image_list.push(input.files[index]);
                    
                }
                reader.readAsDataURL(input.files[index]);
                index ++;
                }
                console.log('image_list',this.image_list)
            }
            // console.log('tag', this.image_list)
            this.$emit('update:modelValue', this.image_list)
            this.active = false
        },
        async deleteImage(){
            if (this.liveUpload) {
                this.loader=true
            await axios.delete(this.liveURL+this.delURL+this.image_list[this.index_number])
                .then(() => {
                    this.loader=false
                    this.preview_list.splice(this.index_number,1)
                    this.image_list.splice(this.index_number,1)
                    this.$emit('update:modelValue', this.image_list)
                    this.del_image=false
                }).catch((err) => {
                    this.loader=false
                    console.log(err)
                });
            }
             else{
                if (this.deleteURL) {
                    this.del_image=false
                    this.loader=true
                     await axios.delete(this.deleteURL+this.liveImageName[this.index_number])
                    this.image_list.splice(this.index_number,1)
                    this.preview_list.splice(this.index_number,1)
                    this.loader=false
                }
            }
            
            this.$emit('update:modelValue', this.image_list)
        },
        re_upload(index){
            this.index_number=index
            this.$refs.re_upload.click()
        },
        async pickFile(index){
            let file =this.$refs.re_upload.files
            if (this.liveUpload) {
                this.loader=true
                const apiClient = axios.create({
                baseURL: this.liveURL,
                withCredentials: false,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
                })
                const formData = new FormData()
                formData.append('image',file[0])
                
                await apiClient.post(this.postRoute, formData)
                    .then((result) => {
                        
                        this.preview_list.push(this.liveURL+this.getRoute+result.data.name)
                        this.image_list.push(result.data.name)
                    }).catch((err) => {
                        this.loader=false
                        console.log(err)
                    });
                await apiClient.post(this.delURL+this.image_list[index])
                    .then(() => {
                        this.preview_list.splice(index,1)
                        this.image_list.splice(index,1)
                        this.loader=false
                    }).catch((err) => {
                        this.loader=false
                        console.log(err)
                    });
            } else {
                this.image_list.splice(index, 1)
                let reader = new FileReader
                reader.onload = e => {
                    this.preview_list[index] = e.target.result
                }
                reader.readAsDataURL(file[0])
                this.image_list.push(file[0])
                await axios.delete(this.deleteURL+this.liveImageName[this.index_number])
                this.loader=false
            }
            this.$emit('update:modelValue', this.image_list)
        },
        toggleActive(){
            this.active = !this.active
        },
        append_files(event){
            this.previewMultiImage(event, event.dataTransfer)
            this.active = false
        },
        expand(index){
            this.full_image=this.preview_list[index]
        },
        del_confirm(index){
            this.del_image=true
            this.index_number=index
        }
    }
}
</script>

<style scoped >
.imagePreviewWrapper {
   width: 250px;
    height: 250px;
    display: block;
    cursor: pointer;
    margin: 0 auto;
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
}
.image_list{
    display: flex;
    flex-wrap: wrap;
    border: 1px solid #222;
    border-radius: 10px;
    width: 380px;
    margin: 0px auto;
    padding: 15px;
    min-height: 150px;
    justify-content: center;
    align-items: center;
}
.image{
    width: 170px;
    height: 125px;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
.image-div{
    position: relative;
    margin: 10px;
    border-radius: 10px;
}
.image_actions{
    display: flex;
    flex-wrap: wrap;
    position: absolute;
    transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    transition: .5s ease;
    opacity: 0;
    width: 70%;
}
.image-div:hover .image{
    opacity: 0.3;
}
.image-div:hover .image_actions{
    opacity: 1;
}
i.fas {
    margin: 5px;
    cursor: pointer;
    font-size: 30px;
}
a{
    color: #28A746;
}
.del{
    background: crimson;
}
.dismiss{
    background: #28A746;
}
.active{
    background:#28A746;
    opacity: 0.3;
}
.modal{
    position: relative;
    max-width: 978px;
    margin: auto;

}
i.fas.fa-times-circle{
    position: absolute;
    right: 0;
}
.modal-backdrop{
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
.full-image{
    width: 100% !important;
    max-height: 80vh;
}
.delete_images{
    background: #fff;
    border-radius: 10px;
    padding: 25px;
}
button{
    color: #fff;
    padding: 10px 25px;
    margin: 10px;
    font-size: 20px;
    border-radius: 10px;
    border: 0px;
  }
  button:hover{
    cursor:pointer;
  }
  .loader {
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 75px;
    height: 75px;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
    }

    /* Safari */
        @-webkit-keyframes spin {
        0% { -webkit-transform: rotate(0deg); }
        100% { -webkit-transform: rotate(360deg); }
        }

        @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>