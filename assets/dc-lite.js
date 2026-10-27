/*
 * dc-lite: a tiny template runtime for the Sommet360 AI mock-ups.
 * Supports {{ path }} holes, <sc-if value="{{ x }}">, <sc-for list="{{ xs }}" as="item">,
 * onClick="{{ fn }}" handlers and a React-like Component with state / setState.
 * Templates are processed as strings, so <sc-for> inside <tbody> works.
 */
(function () {
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) {
      const next = typeof patch === 'function' ? patch(this.state) : patch;
      this.state = Object.assign({}, this.state, next);
      if (this.__render) this.__render();
    }
    forceUpdate() { if (this.__render) this.__render(); }
  }

  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function lookup(path, scopes) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^'.*'$/.test(path)) return path.slice(1, -1);
    const parts = path.split('.');
    for (let i = scopes.length - 1; i >= 0; i--) {
      const s = scopes[i];
      if (s && Object.prototype.hasOwnProperty.call(s, parts[0])) {
        let v = s[parts[0]];
        for (let k = 1; k < parts.length; k++) v = v == null ? undefined : v[parts[k]];
        return v;
      }
    }
    return undefined;
  }

  function attr(tag, name) {
    const m = tag.match(new RegExp(name + '\\s*=\\s*"([^"]*)"'));
    return m ? m[1] : null;
  }
  function holePath(v) { const m = v && v.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/); return m ? m[1] : null; }

  function findClose(tpl, from, name) {
    const re = new RegExp('<' + name + '[\\s>]|</' + name + '>', 'g');
    re.lastIndex = from;
    let depth = 1, m;
    while ((m = re.exec(tpl))) {
      if (m[0][1] === '/') { depth--; if (depth === 0) return m.index; } else depth++;
    }
    throw new Error('Unclosed <' + name + '>');
  }

  function render(tpl, scopes, handlers) {
    let out = '', i = 0;
    const open = /<(sc-if|sc-for)\b[^>]*>/g;
    let m;
    while ((m = open.exec(tpl))) {
      out += plain(tpl.slice(i, m.index), scopes, handlers);
      const name = m[1], tag = m[0];
      const bodyStart = m.index + tag.length;
      const closeAt = findClose(tpl, bodyStart, name);
      const body = tpl.slice(bodyStart, closeAt);
      if (name === 'sc-if') {
        if (lookup(holePath(attr(tag, 'value')) || 'false', scopes)) out += render(body, scopes, handlers);
      } else {
        const list = lookup(holePath(attr(tag, 'list')) || '', scopes) || [];
        const as = attr(tag, 'as') || 'item';
        list.forEach((item, idx) => {
          const sc = {}; sc[as] = item; sc.$index = idx;
          out += render(body, scopes.concat([sc]), handlers);
        });
      }
      i = closeAt + name.length + 3;
      open.lastIndex = i;
    }
    return out + plain(tpl.slice(i), scopes, handlers);
  }

  function plain(s, scopes, handlers) {
    s = s.replace(/\son([A-Z][A-Za-z]*)\s*=\s*"\s*\{\{\s*([^}]+?)\s*\}\}\s*"/g, (all, ev, path) => {
      const fn = lookup(path, scopes);
      if (typeof fn !== 'function') return '';
      handlers.push(fn);
      return ' data-dc-ev="' + ev.toLowerCase() + ':' + (handlers.length - 1) + '"';
    });
    return s.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (all, path) => esc(lookup(path, scopes)));
  }

  function mount(rootSel, tplSel, Component) {
    const root = document.querySelector(rootSel);
    const tpl = document.querySelector(tplSel).textContent;
    const inst = new Component({});
    inst.__render = () => {
      const handlers = [];
      const vals = inst.renderVals ? inst.renderVals() : {};
      root.innerHTML = render(tpl, [vals], handlers);
      root.querySelectorAll('[data-dc-ev]').forEach((el) => {
        const [ev, idx] = el.getAttribute('data-dc-ev').split(':');
        el.addEventListener(ev, (e) => { if (el.tagName === 'A' && !el.getAttribute('href')) e.preventDefault(); handlers[+idx](e); });
      });
    };
    inst.__render();
    if (inst.componentDidMount) inst.componentDidMount();
  }

  window.DCLogic = DCLogic;
  window.dcMount = mount;
})();
