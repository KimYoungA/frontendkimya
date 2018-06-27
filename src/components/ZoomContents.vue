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
    },
    top: {
      type: Number,
      default: 0
    },
    left: {
      type: Number,
      default: 0
    },
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    show: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    imageSrc () {
      var src = require.context('../assets/', true)

      return src('./' + this.src);
    }
  },

  methods: {
    zoom: function() {
      this.$emit('zooming', this.id);
    }
  },

  render (createElement) {
    return createElement(
      'img',{
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
