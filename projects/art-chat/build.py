html = open('/workspace/art-chat/index.html').read()
print('Current size:', len(html), 'chars')
print('Last 80:', repr(html[-80:]))
