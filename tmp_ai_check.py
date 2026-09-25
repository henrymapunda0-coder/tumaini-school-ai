import ai_backend
samples = [
    'Help me study for biology and mathematics in one week',
    'I am in form 4, explain photosynthesis and give me a quiz',
    'What is AI and how can it help students?',
    'Create a project topic on chemistry and give me 5 steps',
]
for s in samples:
    print('QUESTION:', s)
    print(ai_backend.generate_reply(s))
    print('---')
