const React = require("react");
const {
  Component,
  PropTypes
} = React;
const ndarray = require("ndarray");
const PreviewRenderer = require("./PreviewRenderer");
const imageCache = require("./imageCache");
const sharedRenderer = new PreviewRenderer();

const styles = {
  preview: {
    marginTop: "4px",
    paddingTop: "2px",
    textAlign: "center"
    //background: "#f9f9f9"  // FIXME we need to remove the main padding..
  },
  previewHeader: {
    fontSize: "10px"
  },
  dim: {
    color: "#aaa"
  },
  canvas: {
    background: "#f3f3f3 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAARklEQVRYw+3XwQkAIAwEwYvYf8uxBcE8fMwWEAbuleruDDd6cOXzAAEBAQEBAQEBAQFf2tM/RJIyMSAgICAgICAgICDgZQeYxgVOKu5KXQAAAABJRU5ErkJggg==) repeat",
    backgroundSize: "20px 20px",
    border: "1px solid #666"
  }
};

class Preview extends Component {

  shouldComponentUpdate ({ data }) {
    return !!data;
  }

  componentDidMount () {
    const { data } = this.props;
    if (data) this.syncData(data);
  }

  componentDidUpdate ({data}) {
    if (data) this.syncData(data);
  }

  drawRaw ({ pixels, width, height }) {
    const {
      ctx
    } = this;
    const data = ctx.getImageData(0, 0, width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < 4 * width; x++) {
        data.data[(height-y-1) * 4 * width + x] = pixels[y * 4 * width + x];
      }
    }
    ctx.putImageData(data, 0, 0);
  }

  syncData (data) {
    if (this.img) {
      this.img.onload = null;
      this.img.src = null;
      this.img = null;
    }
    if (typeof data === "string") {
      imageCache.load(data, img => {
        sharedRenderer.render(img);
        sharedRenderer.copyToCanvas2D(this.ctx);
      });
    }
    else {
      if (data.pixels && data.width && data.height) {
        // "raw data"
        data = ndarray(data.pixels, [ data.height, data.width, 4 ]).transpose(1, 0, 2);
      }
      sharedRenderer.render(data);
      sharedRenderer.copyToCanvas2D(this.ctx);
    }
  }

  render () {
    const { data, maxWidth, maxHeight, title } = this.props;

    const { width, height } = sharedRenderer.getSizeForData(data);

    const canvasStyle = {
      ...styles.canvas,
      maxHeight: maxHeight+"px",
      maxWidth: maxWidth+"px"
    };

    return <div style={styles.preview}>
      <div style={styles.previewHeader}>
        <span style={styles.dim}>{width}⨉{height}</span>
      </div>
      <canvas
        title={title}
        style={canvasStyle}
        ref={ref => {
          if (!ref) return;
          const canvas = React.findDOMNode(ref);
          const ctx = canvas.getContext("2d");
          if ("imageSmoothingEnabled" in ctx) {
            ctx.imageSmoothingEnabled = false;
          }
          else {
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
          }
          this.canvas = canvas;
          this.ctx = ctx;
        }}
      />
    </div>;
  }
}

Preview.propTypes = {
  data: PropTypes.any,
  maxWidth: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  title: PropTypes.string
};

module.exports = Preview;
