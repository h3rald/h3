const mod = require('../h3.js');
const h3 = mod.h3;
const h = mod.h;

describe('VNode', () => {
  it('should provide a from method to initialize itself from an object', () => {
    const fn = () => true;
    const obj = {
      id: 'test',
      type: 'input',
      value: 'AAA',
      $html: '',
      data: { a: '1', b: '2' },
      eventListeners: { click: fn },
      children: [],
      props: { title: 'test' },
      classList: ['a1', 'a2'],
      style: 'padding: 2px',
    };
    const vnode1 = h('br');
    vnode1.from(obj);
    const vnode2 = h('input#test.a1.a2', {
      value: 'AAA',
      $html: '',
      data: { a: '1', b: '2' },
      onclick: fn,
      title: 'test',
      style: 'padding: 2px',
    });
    expect(vnode1).toEqual(vnode2);
  });

  it('should provide a render method able to render textual nodes', () => {
    const createTextNode = jest.spyOn(document, 'createTextNode');
    const vnode = h({ type: '#text', value: 'test' });
    const node = vnode.render();
    expect(createTextNode).toHaveBeenCalledWith('test');
    expect(node.constructor).toEqual(Text);
  });

  it('should provide a render method able to render simple element nodes', () => {
    const createElement = jest.spyOn(document, 'createElement');
    const vnode = h('br');
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith('br');
    expect(node.constructor).toEqual(HTMLBRElement);
  });

  it('should provide a render method able to render element nodes with props and classes', () => {
    const createElement = jest.spyOn(document, 'createElement');
    const vnode = h('span.test1.test2', { title: 'test', falsy: false });
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith('span');
    expect(node.constructor).toEqual(HTMLSpanElement);
    expect(node.getAttribute('title')).toEqual('test');
    expect(node.classList.value).toEqual('test1 test2');
  });

  it('should provide a render method able to render element nodes with children', () => {
    const vnode = h('ul', [h('li', 'test1'), h('li', 'test2')]);
    const createElement = jest.spyOn(document, 'createElement');
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith('ul');
    expect(createElement).toHaveBeenCalledWith('li');
    expect(node.constructor).toEqual(HTMLUListElement);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[1].constructor).toEqual(HTMLLIElement);
    expect(node.childNodes[0].childNodes[0].data).toEqual('test1');
  });

  it('should handle boolean props when redrawing', () => {
    const vnode1 = h('input', { type: 'checkbox', checked: true });
    const node = vnode1.render();
    expect(node.checked).toEqual(true);
    const vnode = h('input', { type: 'checkbox', checked: false });
    vnode1.redraw({ node, vnode });
    expect(node.checked).toEqual(false);
  });

  it('should handle falsy props when redrawing', () => {
    const vnode1 = h('test-element', { q: 1 });
    const node = vnode1.render();
    expect(node.q).toEqual(1);
    const vnode = h('test-element', { q: 0 });
    vnode1.redraw({ node, vnode });
    expect(node.q).toEqual(0);
    expect(vnode1.props.q).toEqual(0);
  });

  it('should handle non-string props as properties and not create attributes', () => {
    const v = h('div', {
      test: true,
      obj: { a: 1, b: 2 },
      arr: [1, 2, 3],
      num: 2.3,
      str: 'test',
      s: '',
      title: 'testing!',
      value: false,
    });
    const v2 = h('div', {
      test: true,
      obj: { a: 1, b: 2 },
      arr: [1, 2, 3],
      s: '',
      title: 'testing!',
      value: 'true',
    });
    const n = v.render();
    expect(n.test).toEqual(true);
    expect(n.obj).toEqual({ a: 1, b: 2 });
    expect(n.arr).toEqual([1, 2, 3]);
    expect(n.num).toEqual(2.3);
    expect(n.str).toEqual('test');
    expect(n.getAttribute('str')).toEqual('test');
    expect(n.s).toEqual('');
    expect(n.getAttribute('s')).toEqual('');
    expect(n.title).toEqual('testing!');
    expect(n.getAttribute('title')).toEqual('testing!');
    expect(n.value).toEqual(undefined);
    expect(n.getAttribute('value')).toEqual(null);
    v.redraw({ node: n, vnode: v2 });
    expect(n.getAttribute('value')).toEqual('true');
    v2.value = null;
    v.redraw({ node: n, vnode: v2 });
    expect(n.getAttribute('value')).toEqual('');
  });

  it('should provide a render method able to render element nodes with a value', () => {
    let vnode = h('input', { value: 'test' });
    const createElement = jest.spyOn(document, 'createElement');
    let node = vnode.render();
    expect(createElement).toHaveBeenCalledWith('input');
    expect(node.constructor).toEqual(HTMLInputElement);
    expect(node.value).toEqual('test');
    vnode = h('input', { value: null });
    node = vnode.render();
    expect(node.value).toEqual('');
    vnode = h('test', { value: 123 });
    node = vnode.render();
    expect(node.getAttribute('value')).toEqual('123');
    expect(node.value).toEqual(undefined);
  });

  it('should provide a render method able to render element nodes with event handlers', () => {
    const handler = () => {
      console.log('test');
    };
    const vnode = h('button', { onclick: handler });
    const button = document.createElement('button');
    const createElement = jest.spyOn(document, 'createElement').mockImplementationOnce(() => {
      return button;
    });
    const addEventListener = jest.spyOn(button, 'addEventListener');
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith('button');
    expect(node.constructor).toEqual(HTMLButtonElement);
    expect(addEventListener).toHaveBeenCalledWith('click', handler);
  });

  it('it should provide a render method able to render elements with special props', () => {
    const vnode = h('div', {
      id: 'test',
      style: 'margin: auto;',
      data: { test: 'aaa' },
      $html: '<p>Hello!</p>',
    });
    const createElement = jest.spyOn(document, 'createElement');
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith('div');
    expect(node.constructor).toEqual(HTMLDivElement);
    expect(node.style.cssText).toEqual('margin: auto;');
    expect(node.id).toEqual('test');
    expect(node.dataset['test']).toEqual('aaa');
    expect(node.childNodes[0].textContent).toEqual('Hello!');
  });

  it('should provide a redraw method that is able to add new DOM nodes', () => {
    const oldvnode = h('div#test', h('span'));
    const newvnodeNoChildren = h('div');
    const newvnode = h('div', [h('span#a'), h('span')]);
    const node = oldvnode.render();
    const span = node.childNodes[0];
    oldvnode.redraw({ node: node, vnode: newvnodeNoChildren });
    expect(oldvnode.children.length).toEqual(0);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(oldvnode.children.length).toEqual(2);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[0].id).toEqual('a');
    expect(span).toEqual(node.childNodes[1]);
  });

  it('should provide a redraw method that is able to remove existing DOM nodes', () => {
    let oldvnode = h('div', [h('span#a'), h('span')]);
    let newvnode = h('div', [h('span')]);
    let node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(oldvnode.children.length).toEqual(1);
    expect(node.childNodes.length).toEqual(1);
    oldvnode = h('div.test-children', [h('span.a'), h('span.b')]);
    node = oldvnode.render();
    newvnode = h('div.test-children', [h('div.c')]);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(oldvnode.children.length).toEqual(1);
    expect(node.childNodes.length).toEqual(1);
    expect(oldvnode.children[0].classList[0]).toEqual('c');
  });

  it('should provide a redraw method that is able to figure out differences in children', () => {
    const oldvnode = h('div', [h('span', 'a'), h('span'), h('span', 'b')]);
    const newvnode = h('div', [h('span', 'a'), h('span', 'c'), h('span', 'b')]);
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node.childNodes[1].textContent).toEqual('c');
  });

  it('should provide a redraw method that is able to figure out differences in existing children', () => {
    const oldvnode = h('div', [h('span.test', 'a'), h('span.test', 'b'), h('span.test', 'c')]);
    const newvnode = h('div', [h('span.test', 'a'), h('span.test1', 'b'), h('span.test', 'c')]);
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node.childNodes[0].classList[0]).toEqual('test');
    expect(node.childNodes[1].classList[0]).toEqual('test1');
    expect(node.childNodes[2].classList[0]).toEqual('test');
  });

  it('should provide a redraw method that is able to update different props', () => {
    const oldvnode = h('span', { title: 'a', something: 'b' });
    const newvnode = h('span', { title: 'b', id: 'bbb' });
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.getAttribute('title')).toEqual('b');
    expect(node.getAttribute('id')).toEqual('bbb');
    expect(node.hasAttribute('something')).toEqual(false);
  });

  it('should provide a redraw method that is able to update different classes', () => {
    const oldvnode = h('span.a.b', { title: 'b' });
    const newvnode = h('span.a.c', { title: 'b' });
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.classList.value).toEqual('a c');
  });

  it('should provide redraw method to detect changed nodes if they have different elements', () => {
    const oldvnode = h('span.c', { title: 'b' });
    const newvnode = h('div.c', { title: 'b' });
    const container = document.createElement('div');
    const node = oldvnode.render();
    container.appendChild(node);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node).not.toEqual(container.childNodes[0]);
    expect(node.constructor).toEqual(HTMLSpanElement);
    expect(container.childNodes[0].constructor).toEqual(HTMLDivElement);
  });

  it('should provide redraw method to detect position changes in child nodes', () => {
    const v1 = h('ul', [h('li.a'), h('li.b'), h('li.c'), h('li.d')]);
    const v2 = h('ul', [h('li.c'), h('li.b'), h('li.a'), h('li.d')]);
    const n = v1.render();
    expect(n.childNodes[0].classList[0]).toEqual('a');
    v1.redraw({ node: n, vnode: v2 });
    expect(n.childNodes[0].classList[0]).toEqual('c');
  });

  it('should optimize insertion and deletions when redrawing if all old/new children exist', () => {
    const v = h('div', h('a'), h('d'));
    const vnode = h('div', h('a'), h('b'), h('c'), h('d'));
    const node = v.render();
    v.redraw({ node, vnode });
    expect(v.children.length).toEqual(4);
  });

  it('should provide redraw method to detect changed nodes if they have different node types', () => {
    const oldvnode = h('span.c', { title: 'b' });
    const newvnode = h({ type: '#text', value: 'test' });
    const container = document.createElement('div');
    const node = oldvnode.render();
    container.appendChild(node);
    expect(node.constructor).toEqual(HTMLSpanElement);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node).not.toEqual(container.childNodes[0]);
    expect(container.childNodes[0].data).toEqual('test');
  });

  it('should provide redraw method to detect changed nodes if they have different text', () => {
    const oldvnode = h({ type: '#text', value: 'test1' });
    const newvnode = h({ type: '#text', value: 'test2' });
    const container = document.createElement('div');
    const node = oldvnode.render();
    container.appendChild(node);
    expect(node.data).toEqual('test1');
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(container.childNodes[0].data).toEqual('test2');
  });

  it('should provide redraw method to detect changed nodes and recurse', () => {
    const oldvnode = h('ul.c', { title: 'b' }, [h('li#aaa'), h('li#bbb'), h('li#ccc')]);
    const newvnode = h('ul.c', { title: 'b' }, [h('li#aaa'), h('li#ccc')]);
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[0].getAttribute('id')).toEqual('aaa');
    expect(node.childNodes[1].getAttribute('id')).toEqual('ccc');
  });

  it('should provide a redraw method able to detect specific changes to style, data, value, props, $onrender and eventListeners', () => {
    const fn = () => false;
    const oldvnode = h('input', {
      style: 'margin: auto;',
      data: { a: 111, b: 222, d: 444 },
      value: null,
      title: 'test',
      label: 'test',
      onkeydown: () => true,
      onclick: () => true,
      onkeypress: () => true,
    });
    const newvnode = h('input', {
      style: false,
      data: { a: 111, b: 223, c: 333 },
      title: 'test #2',
      label: 'test',
      something: false,
      somethingElse: { test: 1 },
      value: 0,
      placeholder: 'test',
      onkeydown: () => true,
      onkeypress: () => false,
      $onrender: () => true,
      onhover: () => true,
    });
    const newvnode2 = h('input', {
      style: false,
      data: { a: 111, b: 223, c: 333 },
      title: 'test #2',
      label: 'test',
      something: false,
      somethingElse: { test: 1 },
      placeholder: 'test',
      onkeydown: () => true,
      onkeypress: () => false,
      $onrender: () => true,
      onhover: () => true,
    });
    const container = document.createElement('div');
    const node = oldvnode.render();
    expect(node.value).toEqual('');
    container.appendChild(node);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.style.cssText).toEqual('');
    expect(node.dataset['a']).toEqual('111');
    expect(node.dataset['c']).toEqual('333');
    expect(node.dataset['b']).toEqual('223');
    expect(node.dataset['d']).toEqual(undefined);
    expect(node.something).toEqual(false);
    expect(node.getAttribute('title')).toEqual('test #2');
    expect(node.getAttribute('placeholder')).toEqual('test');
    expect(node.value).toEqual('0');
    oldvnode.redraw({ node, vnode: newvnode2 });
    expect(node.value).toEqual('');
  });

  it('should handle value property/attribute for non-input fields', () => {
    const v = h('test', { value: null });
    const n = v.render();
    expect(n.value).toEqual(undefined);
    expect(n.getAttribute('value')).toEqual(null);
  });

  it('should provide a redraw method able to detect changes in child content', () => {
    const v1 = h('ul', [h('li', 'a'), h('li', 'b')]);
    const n1 = v1.render();
    const v2 = h('ul', {
      $html: '<li>a</li><li>b</li>',
      $onrender: (node) => node.classList.add('test'),
    });
    const v3 = h('ul', [h('li', 'a')]);
    const v4 = h('ul', [h('li', 'b')]);
    const n2 = v2.render();
    const n3 = v3.render();
    expect(n2.childNodes[0].childNodes[0].data).toEqual(n1.childNodes[0].childNodes[0].data);
    v1.redraw({ node: n1, vnode: v2 });
    expect(n1.classList[0]).toEqual('test');
    expect(v1).toEqual(v2);
    v3.redraw({ node: n3, vnode: v4 });
    expect(v3).toEqual(v4);
  });

  it('should execute $onrender callbacks whenever a child node is added to the DOM', async () => {
    let n;
    const $onrender = (node) => {
      n = node;
    };
    const vn1 = h('ul', [h('li')]);
    const vn2 = h('ul', [h('li'), h('li.vn2', { $onrender })]);
    const n1 = vn1.render();
    vn1.redraw({ node: n1, vnode: vn2 });
    expect(n.classList.value).toEqual('vn2');
    const vn3 = h('ul', [h('span.vn3', { $onrender })]);
    vn1.redraw({ node: n1, vnode: vn3 });
    expect(n.classList.value).toEqual('vn3');
    const rc = () => h('div.rc', { $onrender });
    await h3.init(rc);
    expect(n.classList.value).toEqual('rc');
    const rc2 = () => vn2;
    await h3.init(rc2);
    expect(n.classList.value).toEqual('vn2');
  });
});
