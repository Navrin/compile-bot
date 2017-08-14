# Discord Compile Bot

ideas:

* use a cli like flag system to run eval, like

```bash
e!run -i hello -l py \`\`\`python
    print(input('From stdin: '))
\`\`\`

e!run -c "bash main.sh 42" -f "main.sh" \`\`\`bash
echo Number from arg: $1
\`\`\`

e!run -l js 10 + 10;

e!run -l js `10 + 10;`

e!run \`\`\`js
10 + 10;
\`\`\`
```