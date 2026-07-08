document.addEventListener('DOMContentLoaded', () => {
  const replacements = [
    ['Authorised Dealer', 'Authorised Distribution Partner'],
    ['Dealer name available on request', 'Distribution partner name available on request'],
    ['dealer entries', 'distribution entries'],
    ['dealer entry', 'distribution entry'],
    ['dealer list', 'distribution list'],
    ['dealer information', 'distribution information'],
    ['Dealer information', 'Distribution information'],
    ['Dealer list', 'Distribution list'],
    ['dealer assistance', 'distribution assistance'],
    ['available public dealer entries', 'available public distribution entries'],
    ['authorised dealer entries', 'authorised distribution entries'],
    ['dealers by approximate distance', 'distribution partners by approximate distance'],
    ['Dealer', 'Distribution Partner'],
    ['dealer', 'distribution partner']
  ];

  const rewriteText = (node) => {
    if (!node || node.nodeType !== Node.TEXT_NODE || !node.nodeValue) return;
    let text = node.nodeValue;
    replacements.forEach(([from, to]) => { text = text.split(from).join(to); });
    if (text !== node.nodeValue) node.nodeValue = text;
  };

  const walk = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) rewriteText(node);
  };

  walk(document.body);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) rewriteText(node);
        else if (node.nodeType === Node.ELEMENT_NODE) walk(node);
      });
      if (mutation.type === 'characterData') rewriteText(mutation.target);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
});
