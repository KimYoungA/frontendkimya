<template>
  <div id="zoomTarget">
    <div id="target" class="target">
      <img id="mainImage" src="../assets/test_image_1.jpg" class="ZoomTarget-full-image" alt="Background Image" />
      <transition name="fade">
        <div id="shadow" class="shadow" v-show="zoomedContent">
        </div>
      </transition>
      <div id="zoomPoint">
        <zoom-points
          v-for="point in points"
          :id="point.id"
          :key="point.id"
          :src="point.src"
          :cssClass="point.class"
          :top="point.y"
          :left="point.x"
          :width="point.width"
          :height="point.height"
          v-on:zoomIn="zooming"
        />
      </div>
      <div>
        <zoom-contents
          v-for="content in contents"
          :id="content.id"
          :key="content.id"
          :src="content.src"
          :cssClass="content.class"
          :top="content.y"
          :left="content.x"
          v-show="content.show"
        />
        <zoom-out-button
          :id="'back'"
          :src="'back.png'"
          :cssClass="'back-button'"
          v-on:zoomOut="back"
        />
      </div>
    </div>
  </div>
</template>
<script>
import ZoomPoints from './ZoomPoints.vue';
import ZoomContents from './ZoomContents.vue';
import ZoomOutButton from './ZoomOutButton.vue';

document.documentElement.addEventListener('touchstart', function (event) {
  if (event.touches.length > 1) {
   event.preventDefault();
  }
 }, false);

 // 각 줌인 포인트의 원본 이미지 상에서의 좌표 비율
 const RATIO_POINTS_DISPLAY = [
   {x: 50, y: 72.5},
   {x: 13.1, y: 19},
   {x: 79, y: 72.5}
 ];

export default {
  name: 'zoomTarget',
  components: {
    ZoomPoints,
    ZoomContents,
    ZoomOutButton
  },

  data() {
    return {
      // 줌인을 위한 클릭 포인트 데이터
      points: [
        {
          id: "zoomPoint1",
          src: "icon.png",
          class: "ZoomTarget-point-image",
          x: 488,
          y: 550,
          width: 40,
          height: 40
        },
        {
          id: "zoomPoint2",
          src: "icon.png",
          class: "ZoomTarget-point-image",
          x: 131,
          y: 139,
          width: 40,
          height: 40
        },
        {
          id: "zoomPoint3",
          src: "icon.png",
          class: "ZoomTarget-point-image",
          x: 770,
          y: 550,
          width: 40,
          height: 40
        }
      ],

      // 줌인 컨텐츠 데이터
      contents: [
        {
          id: "zoom1",
          pointKey: "zoomPoint1",
          src: "test_image_2.jpg",
          class: "ZoomTarget-content-image",
          x: 488,
          y: 550,
          width: 0,
          height: 0,
          show: false
        },
        {
          id: "zoom2",
          pointKey: "zoomPoint2",
          src: "test_image_3.jpg",
          class: "ZoomTarget-content-image",
          x: 131,
          y: 139,
          width: 0,
          height: 0,
          show: false
        },
        {
          id: "zoom3",
          pointKey: "zoomPoint3",
          src: "test_image_4.jpg",
          class: "ZoomTarget-content-image",
          x: 770,
          y: 550,
          width: 0,
          height: 0,
          show: false
        }
      ],
      mainImageSize: {width: 0, height:0},    // main image 원본 사이즈
      resizedMain: {width: 0, height:0},      // 화면 크기에 맞춘 main image 크기
      pointSize: 0,                           // 화면 크기에 맞춘 줌 포인트, 백 버튼 크기
      zoomedContent: false,                   // 줌인 상태 플래그
      zoomedPointID: null,                    // 줌인 된 포인트 id
      abc: {x: 0, y:0}
    }
  },

  watch: {
    resizedMain () {
      // 표시되는 이미지 크기에 맞춰 줌 포인트, 백 버튼 크기 계산
      this.pointSize = Math.floor((this.resizedMain.height / 100) * 3);

      // 각 줌인 포인트 좌표의 비율과 원본 이미지의 크기로 표시될 좌표 계산
      for(var i in this.points) {
        this.points[i].width = this.pointSize;
        this.points[i].height = this.pointSize;
        this.points[i].x = RATIO_POINTS_DISPLAY[i].x / 100 * this.resizedMain.width;
        this.points[i].y = RATIO_POINTS_DISPLAY[i].y / 100 * this.resizedMain.height;

        if (!this.zoomedContent || this.contents[i].pointKey != this.zoomedPointID) {
          this.contents[i].x = (RATIO_POINTS_DISPLAY[i].x / 100 * this.resizedMain.width) + this.pointSize / 2;
          this.contents[i].y = (RATIO_POINTS_DISPLAY[i].y / 100 * this.resizedMain.height) + this.pointSize / 2;
        }
        else {
          // 줌인 상태에서 화면 회전 등으로 resize가 필요할 경우
          var x = (RATIO_POINTS_DISPLAY[i].x / 100 * this.resizedMain.width) + this.pointSize / 2;
          var y = (RATIO_POINTS_DISPLAY[i].y / 100 * this.resizedMain.height) + this.pointSize / 2;

          this.$nextTick(function () {
            var newLocation = this.calculateZoomMainImage(y, x);
            $('#mainImage').css({'top':newLocation.top, 'left':newLocation.left});
          })
        }
      }
    }
  },

  methods: {
    /*******************************************************/
    // 줌인 처리
    // pram : id(줌인 포인트 id)
    /*******************************************************/
    zooming(id) {
      var zoomInPoint;
      var afterZoomMainXY;
      var clickedContentID = '#';
      var clickedContent = this.contents.find( function(content) {
        return content.pointKey === id;
      })

      clickedContentID += clickedContent.id;
      this.zoomedPointID = clickedContent.pointKey;
      this.zoomedContent = true;
      clickedContent.show = true;

      zoomInPoint = this.getZoomPoint();
      afterZoomMainXY = this.calculateZoomMainImage(zoomInPoint.top, zoomInPoint.left);

      $('#zoomPoint').hide();

      $('#mainImage').animate({
        top: afterZoomMainXY.top, left: afterZoomMainXY.left, width: "400%", height: "400%"
      },800, function(){

      })

      $(clickedContentID).animate({
        top: "0px", left: "0px", width: "100%", height: "100%"
      }, 800, function(){
        $('#back').show();
      })
    },

    /*******************************************************/
    // 뒤로가기 처리
    /*******************************************************/
    back() {
      var clickedContentID = '#';
      var zoomOutPoint = this.getZoomPoint();
      var clickedContent = this.contents.find( function(content) {
        return content.show === true;
      })

      clickedContentID += clickedContent.id;
      this.zoomedContent = false;

      $('#back').hide();

      $('#mainImage').animate({
        top: "0px", left: "0px", width: this.resizedMain.width, height: this.resizedMain.height
      },800, function(){
      })

      $(clickedContentID).animate({
        top: zoomOutPoint.top, left: zoomOutPoint.left, width: "0%", height: "0%"
      }, 800, function(){
        $('#zoomPoint').show("slow");
        clickedContent.show = false;

      })
    },

    /*******************************************************/
    // 줌인 포인트 따라 메인 이미지 표시 좌표 계산
    // pram   : top(줌인 Y좌표), left(줌인 X좌표)
    // return : top(줌인 후 main Image의 Y좌표),
    //          left(줌인 후 main Image의  X좌표)
    /*******************************************************/
    calculateZoomMainImage (top, left) {
      var clickedPoint = {x: left, y: top};
      var afterZoomMainX = -((4 * clickedPoint.x) - (this.resizedMain.width / 2));
      var afterZoomMainY = -((4 * clickedPoint.y) - (this.resizedMain.height / 2));
      var afterZoomMainW = this.resizedMain.width * 4;
      var afterZoomMainH = this.resizedMain.height * 4;

      // 좌측에 공백이 생기지 않도록 설정
      if (afterZoomMainX > 0) {
        afterZoomMainX = 0;
      }
      // 상단에 공백이 생기지 않도록 설정
      if (afterZoomMainY > 0) {
        afterZoomMainY = 0;
      }
      // 우측에 공백이 생기지 않도록 설정
      if (afterZoomMainX + afterZoomMainW < this.resizedMain.width) {
        afterZoomMainX += this.resizedMain.width - (afterZoomMainX + afterZoomMainW);
      }
      // 하단에 공백이 생기지 않도록 설정
      if (afterZoomMainY + afterZoomMainH < this.resizedMain.height) {
        afterZoomMainY += this.resizedMain.height - (afterZoomMainY + afterZoomMainH);
      }

      return {top: afterZoomMainY, left: afterZoomMainX};
    },

    /*******************************************************/
    //
    /*******************************************************/
    handleResize (event) {
      console.log("ZoomTarget_handleResize(event)");

      this.setMainSize(this.mainImageSize.width, this.mainImageSize.height);
    },

    /*******************************************************/
    // 줌인 상태에서 누락되는 좌표들을 보안하기 위해 줌인/아웃마다 호출
    // return : top(줌인 컨텐츠의 Y좌표), left(줌인 컨텐츠의 X좌표)
    /*******************************************************/
    getZoomPoint () {
      var zoomPoint;
      var zoomedPointID = this.zoomedPointID;
      var clickedContent = this.points.find( function(point) {
        return point.id === zoomedPointID;
      })

      zoomPoint = {top: clickedContent.y + this.pointSize / 2, left: clickedContent.x + this.pointSize / 2};

      return zoomPoint;
    },

    /*******************************************************/
    // 메인 이미지 원본의 가로, 세로 비율 그대로 화면에 표시
    // pram : width(원본 이미지 가로), height(원본 이미지 세로)
    /*******************************************************/
    setMainSize (width, height) {
      var Hpercentage = (height / width) * 100;
      var Wpercentage = (width / height) * 100;
      var setHeight = window.innerWidth * Hpercentage / 100;
      var setWidth = window.innerHeight * Wpercentage / 100;

      if (window.innerWidth < setWidth) {
        setWidth = window.innerWidth;
      }
      else if (window.innerHeight < setHeight) {
        setHeight = window.innerHeight;
      }

      this.resizedMain = {width: setWidth, height: setHeight};

      $('#target').css({'max-width':setWidth, 'max-height':setHeight});

      // 줌인 상태에서 화면 resize 되었을 경우
      if (this.zoomedContent) {
        setWidth *= 4;
        setHeight *= 4;
      }
      $('#mainImage').css({'width':setWidth, 'height':setHeight});
    },

    originalImageSize () {
      this.mainImageSize = {
        height: 1080,
        width: 1920
      }
    }
  },

  mounted () {
    this.originalImageSize();
    this.setMainSize(this.mainImageSize.width, this.mainImageSize.height);

    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
  },
}
</script>
<style>
.target {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  margin: auto;
}

.ZoomTarget-full-image {
  position: absolute;
}

.shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  background-color: rgba(0, 0, 0, 0.6);
}

.ZoomTarget-point-image, .ZoomTarget-content-image {
  position: absolute;
}

.back-button {
   position: absolute;
   top: 85%;
   left: 47%;
   width: 6%;
   height: auto;
   display: none;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .8s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave {
  opacity: 1;
}

#zoomTarget {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
