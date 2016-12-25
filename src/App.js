import m from 'mithril';
import logo from './logo.svg';
import './App.css';
import { select as d3select, mouse as d3mouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale';

import Pythagoras from './Pythagoras';

const bounceTime = 10;
const realMax = 11;

function next(vnode) {
  const { currentMax } = vnode.state;

  if (currentMax < realMax) {
    vnode.state.currentMax = currentMax + 1;
    setTimeout(next.bind(null, vnode), 500);
    m.redraw();
  }
}

function queueRedraw(state) {
  m.redraw();
  state.bounced = true;
  setTimeout(() => {
    state.bounced = false;
  }, bounceTime);
}

function bindMouse(parentNode, vnode) {
  return function onCreate(vnode) {
    d3select(vnode.dom).on("mousemove", onMouseMove.bind(null, vnode, parentNode.state));

    next(parentNode);
  }
}

function onMouseMove(vnode, state) {
  if (state.bounced) return;
  queueRedraw(state);

  const svg = state.svg;
  const [x, y] = d3mouse(vnode.dom),

    scaleFactor = scaleLinear().domain([svg.height, 0])
    .range([0, .8]),

    scaleLean = scaleLinear().domain([0, svg.width/2, svg.width])
    .range([.5, 0, -.5]);

  state.heightFactor = scaleFactor(y);
  state.lean = scaleLean(x);
}

const App = {
  bounced: false,
  svg: {
    width: 1280,
    height: 600
  },
  currentMax: 0,
  baseW: 80,
  heightFactor: 0,
  lean: 0,

  oninit(vnode) {
    vnode.state.onsvgcreate = bindMouse(vnode);
  },

  view(vnode) {
    const state = vnode.state;
    const svg = state.svg;

    return (
      m('.App', [
        m('.App-header', [
          m('img.App-logo', { src: logo, title: 'lol not react', alt: 'logo' }),
          m('h2', [ 'This is a dancing Pythagoras tree' ])
        ]),
        m('p.App-intro', [
          m('svg', {
            width: svg.width,
            height: svg.height,
            style: { border: "1px solid lightgray" },
            oncreate: state.onsvgcreate,
          }, [
            m(Pythagoras, {
              w: state.baseW,
              h: state.baseW,
              heightFactor: state.heightFactor,
              lean: state.lean,
              x: (svg.width / 2 - 40),
              y: (svg.height - state.baseW),
              lvl: 0,
              maxlvl: state.currentMax,
            })
          ])
        ])
      ])
    );
  }
};

export default App;
