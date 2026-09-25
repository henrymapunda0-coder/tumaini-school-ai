import ai_backend

samples = [
    'fanya ai iwe bora zaidi duniani',
    'make ai more human and smarter',
    'jina la mkuu wa shule',
    'nisaidie kupiga story ya muda mrefu',
    'habari, unaweza kunisaidia?',
]

for s in samples:
    print('QUESTION:', s)
    print(ai_backend.local_reply(s))
    print('---')
