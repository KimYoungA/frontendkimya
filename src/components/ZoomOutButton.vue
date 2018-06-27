<script>
export default {
  props: {
    id: {
      type: String,
      default: null
    },
    src: {
      type: String,
      default: null
    },
    cssClass: {
      type: String,
      default: null
    }
  },

  computed: {
    imageSrc () {
      var src = require.context('../assets/', true)

      return src('./' + this.src);
    }
  },

  methods: {
    clickBack: function() {
      this.$emit('zoomOut');
    }
  },

  render (createElement) {
    return createElement(
      'img',{
        on: {
          click: this.clickBack
        },
        attrs:{
           id:this.id,
           src:this.imageSrc,
           class:this.cssClass,
           style:"top:" + this.top + "px; left:" + this.left + "px; width:" + this.width + "px; height:" + this.height + "px;"
        }
      }
    )
  }
}
</script>
