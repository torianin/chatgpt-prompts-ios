document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket(
    (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host
  );

  const promptForm = document.getElementById('promptForm');
  const promptInput = document.getElementById('promptInput');
  const promptList = document.getElementById('promptList');

  const votedPrompts = new Set(JSON.parse(localStorage.getItem('votedPrompts') || '[]'));

  socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init' || data.type === 'update') {
        updatePromptList(data.prompts);
    }
  });

  promptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const promptText = promptInput.value.trim();

    if (promptText) {
      socket.send(JSON.stringify({ type: 'submit', text: promptText }));
      promptInput.value = '';
    }
  });

  function updatePromptList(prompts) {
      const sortedPrompts = prompts.slice().sort((a, b) => b.votes - a.votes);

      promptList.innerHTML = '';
      sortedPrompts.forEach((prompt, index) => {
        addPromptToList(prompt.text, prompt.votes, prompt.id);
      });
  }

  function addPromptToList(promptText, votes, id) {
 const listItem = document.createElement('li');
  listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

  const promptTextElement = document.createElement('span');
  promptTextElement.textContent = promptText;

  const voteContainer = document.createElement('div');

  const upvoteButton = document.createElement('button');
  upvoteButton.className = 'btn btn-sm btn-outline-primary me-2';
  upvoteButton.disabled = votedPrompts.has(id);
  upvoteButton.addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'vote', id, delta: 1 }));
    votedPrompts.add(id);
    localStorage.setItem('votedPrompts', JSON.stringify(Array.from(votedPrompts)));
    upvoteButton.disabled = true;
  });

  const upvoteIcon = document.createElement('i');
  upvoteIcon.className = 'fas fa-chevron-up';
  upvoteButton.appendChild(upvoteIcon);

  const voteCountElement = document.createElement('span');
  voteCountElement.textContent = votes;
  voteCountElement.className = 'me-2';

  voteContainer.appendChild(upvoteButton);
  voteContainer.appendChild(voteCountElement);

  listItem.appendChild(promptTextElement);
  listItem.appendChild(voteContainer);
  promptList.appendChild(listItem);
  }
});