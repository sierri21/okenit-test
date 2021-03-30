<template>
    <vl-map style="height: 600px" ref="map" @click="showCoordinates" >
        <vl-view ref="view" :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation" height=800px></vl-view>
        <!-- Dots on map -->
        <vl-feature 
            v-for="dot in dots"
            :key="dot.id" 
            :id="dot.id"
        >
            
            <vl-geom-circle v-if="dot.type === 'round'" :coordinates="[dot.x, dot.y]" :radius="dot.size"/>
            <vl-geom-polygon v-else-if="dot.type === 'square'" :coordinates="[getSquare(dot.x, dot.y, dot.size)]"></vl-geom-polygon>
            <vl-geom-polygon v-else-if="dot.type === 'triangle'" :coordinates="[getTriangle(dot.x, dot.y, dot.size)]"></vl-geom-polygon>
            <!-- стили для точек -->
            <vl-style-box>
                <vl-style-fill :color="dot.color"></vl-style-fill>
                <vl-style-stroke color="black" :width="0.5"></vl-style-stroke>
            </vl-style-box>
            <!-- //стили для точек -->
        </vl-feature>
        <!-- //Dots on map -->

        <!-- popup -->
        <vl-overlay
            v-if="isPopupOpen"
            id="overlay"
            :style="!isPopupOpen ? 'opacity: 0; transition: 0.5s' : 'opacity: 1;transition: 0.5s'" 
            :position="[activeDot.x, activeDot.y]">
            <div class="overlay-content">
                <button class="closeBtn" @click="isPopupOpen = false"><span class="material-icons">close</span></button>
                <p><b>X:</b> {{ toLonlat[1] | lonlattostring}}</p>
                <p><b>Y:</b> {{ toLonlat[0] | lonlattostring}}</p>
                <p>
                    <button class="deleteBtn" @click="deleteDot"> Delete </button>
                </p>
                <div>
                    <v-color-picker 
                        hide-inputs                              
                        v-model="activeDot.color"
                    >
                    </v-color-picker>
                </div>
                <div>
                    {{activeDot.size}}
                </div>
            </div>
        </vl-overlay>
        <!-- //popup -->
        
        <!-- map -->
        <vl-layer-tile id="OSM">
            <vl-source-osm></vl-source-osm>
        </vl-layer-tile>
        <!-- //map -->
        
        <!-- creating block -->
        <div class="create-dot">
            <v-btn 
                @click="draw = !draw"
                class="button-add" 
                :fab="true" 
                small
                color="#2196F3"
            >
                <i class="material-icons" color="#FFF">add</i>
            </v-btn>
            <v-card 
                v-if="draw"
                class="add-buttons-group"
            >   
                
                <v-list-item 
                    v-for="type in drawTypes"
                    :key="type.type">
                <label>
                    <i class="material-icons" :style="drawType === type.type ? 'color: red' : 'color: black'">{{type.name}}</i>
                    <input type="radio" name="type" :value="type.type" v-model="drawType" checked>
                </label>
                </v-list-item>
                <v-list-item>
                    <v-slider 
                        v-model="size"
                        vertical
                        :max="1000000"
                        :min="10000"

                    />
                </v-list-item>
            </v-card>
        </div>
    </vl-map> 
</template>

<script>
import lonlattostring from '../filters/lonlat';
export default {
    
    
    name: 'v-map',
    data() {
        return {
            center: [0, 0],
            zoom: 2,
            rotation: 0,
            draw: false,
            drawSize: 500000,
            isPopupOpen: false,
            activeDot: undefined,
            drawType: 'round',
            size: 10, 
            dots: [],
            drawTypes: [
                {
                    name: 'panorama_fish_eye',
                    type: 'round'
                },
                {
                    name: 'crop_square',
                    type: 'square',
                },
                {
                    name: 'change_history',
                    type: 'triangle'
                }
                ],
            clickCoordinate: undefined
        }
    },
    methods: {
        // вычисление координат для квадрата
        getSquare(a, b, size) {
            console.log(a, b, size)
            let arr1 = [a, b]
            let arr2 = [a+size, b]
            let arr3 = [a+size, b+size]
            let arr4 = [a , b+size]
            return [arr1, arr2,arr3,arr4,arr1]
        },
        // вычисление координат для треугольника
        getTriangle(a, b, size) {
            let arr1 = [a,b]
            let arr2 = [a-(size/2), b - size]
            let arr3 = [a+(size/2), b - size]
            return [arr1, arr2, arr3, arr1] 
            
        },
        // Добавление точки или открытие попапа(блок else)
        showCoordinates(event) {
            if (this.draw) {
                this.clickCoordinate = event.coordinate
                let newDot = new Object()
                newDot.id = Date.now()
                newDot.x = event.coordinate[0]
                newDot.y = event.coordinate[1]
                newDot.color = '#FFFFFF'
                newDot.type = this.drawType
                newDot.size = this.size
                this.dots.push(newDot)
            } else {
                this.$refs.map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    let clicked = feature.id_
                    this.activeDot = this.dots.find((item) => item.id == clicked)
                    setTimeout(() => this.isPopupOpen = true, 300)
                })
            }
        },
        // Закрытие попапа
        closePopup() {
            this.isPopupOpen = false
        },
        // Удаление точки
        deleteDot() {
            let idx = this.dots.findIndex(i => i.id === this.activeDot.id)
            this.dots.splice(idx, 1)
            this.closePopup()
            this.activeDot = undefined
        }
    },
    computed: {
        toLonlat() {
            let x = this.activeDot.x
            let lon = (x/6378137.0)/(Math.PI/180.0)

            const e = 0.08181919084262157
            let y = Math.exp( 0 - (this.activeDot.y/6356752.314245179))
            const tol = 0.0000000001
            const eccnth = .5 * e
            const halfPi = Math.PI / 2
            let phi = halfPi - 2. * Math.atan(y)
            let con
            let dphi
            while (Math.abs(dphi)> tol) {
                con = e * Math.sin(phi)
                dphi = halfPi - 2 * Math.atan(y * Math.pow((1. - con) / (1. + con), eccnth)) - phi
                phi += dphi
            }
            let lat = phi / (Math.PI/180.0) 

            return [lon, lat]
        }
    },
    filters: {
        lonlattostring
    }
}
</script>

<style lang="scss" scoped>
    .button-add {
        width: 40px;
        height: 40px;
        position: absolute;
        top: 20px;
        right: 27.5px;
        z-index: 50;
        color: #fff !important;
    }
    .add-buttons-group {
        position: absolute;
        top: 70px;
        right: 20px;
        z-index: 50;
        input {
            display: none;
            &:checked label {
                color: yellow;
            }
        }
    }
    .overlay-content {
        width: 250px;
        position: relative;
        padding: 15px;
        background-color: #fff;
        border-radius: 15px;
        p {
            background-color: #fff;
            padding: 5px;
        }
        & .closeBtn {
            position: absolute;
            top: 5px;
            right: 5px;
            border-radius: 50%;
            background-color: #fff;
        }
        & .deleteBtn {
            width: 100%;
            border-radius: 7px;
            box-shadow: 0 0 3px 0 #000;
        }
    }
</style>