# Importador de Atividades do SISGP/SUSEP

Este projeto tem como objetivo realizar a importação de atividades para o SISGP/SUSEP.

O Sistema PGD (versão Susep) é um sistema utilizado para pactuação e monitoramento dos resultados do Programa de Gestão (teletrabalho), seguindo as diretrizes da [Instrução Normativa nº 65, de 30 de julho de 2020](https://www.in.gov.br/en/web/dou/-/instrucao-normativa-n-65-de-30-de-julho-de-2020-269669395). Ele foi desenvolvido pela Superintendência de Seguros Privados [Susep](http://www.susep.gov.br/login_form) e está
disponível para ser usado por qualquer órgão interessado.

Mais informações, consulte o [Manual do sistema de Programa de Gestão (teletrabalho)](https://www.gov.br/produtividade-e-comercio-exterior/pt-br/acesso-a-informacao/acoes-e-programas/programa-de-gestao-secint/arquivos-e-imagens/manual-sisgp-secint_versao-1-1-convertido.pdf).

## Requisitos

Para executar o projeto, você precisa apenas do [Node.js](https://nodejs.org/) versão 10 ou superior. Além disso, o Sisgp precisa estar instalado e disponível para acesso em um domínio/ip.

## Configurando

Abra o arquivo `config.json` e insira as informações de hospedagem do SGP e usuário com as permissões de inserção de atividades. 

Além disso, adicione o arquivo de atividades em formato `.csv`. O arquivo `activities-example.csv` traz alguns exemplos de atividades que podem importadas, mas também mostra o formato adequado para preencher o arquivo de atividades.

## Executando

    $ node import.js

## Notas

- O projeto irá mostrar no terminal as atividades processadas e cadastradas. 
- Erros podem acontecer, e uma lista de índices das tarefas (iniciando em zero) será escrito no arquivo `errors.json`. 
- Ao executar novamente, apenas as tarefas com erro serão processadas.
