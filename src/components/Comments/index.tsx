import React, { Component } from 'react';

export default class Comments extends Component {
  componentDidMount() {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', true);
    script.setAttribute('repo', 'gabiayako/blog-ignite');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }

  render() {
    return (
      <div
        style={{ width: '100%', marginTop: '5rem' }}
        id="inject-comments-for-uterances"
      />
    );
  }
}
