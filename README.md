# Gestão de Chamados | Alves Tech

Aplicação web para registrar, organizar e acompanhar atendimentos de suporte técnico. O projeto começou como trabalho acadêmico e evoluiu para demonstrar, no portfólio da Alves Tech, um fluxo de chamados mais completo.

## Funcionalidades

- Painel inicial com indicadores e chamados recentes.
- Cadastro de chamados com cliente, endereço, contato, descrição e data do atendimento.
- Consulta do histórico de atendimentos pelo contato informado.
- Pesquisa e filtros de chamados por situação e período diário ou mensal.
- Calendário com indicação dos dias e meses que têm atendimentos.
- Detalhes, conclusão, reabertura e exclusão de chamados.
- Cadastro e consulta de clientes, incluindo clientes identificados em chamados anteriores.
- Relatórios com indicadores por período, volume semanal e situação atual.
- Exportação de backup JSON e limpeza de chamados por intervalo de datas, com confirmação.

## Tecnologias

- React
- JavaScript
- Vite
- HTML e CSS
- LocalStorage

## Dados e armazenamento

Os chamados e clientes ficam armazenados no `LocalStorage` do navegador. O sistema não usa backend nem sincroniza dados entre dispositivos ou navegadores. Para guardar uma cópia, use a exportação de backup disponível em **Configurações**.

Chamados antigos, criados antes do campo de data do atendimento, usam a data original do registro nos filtros e relatórios.

## Como executar localmente

É necessário ter Node.js e Git instalados.

```bash
git clone https://github.com/regesalves/sistema-de-chamados-react.git
cd sistema-de-chamados-react
npm install
npm run dev
```

O Vite informará o endereço local da aplicação, normalmente `http://localhost:5173`.

## Scripts disponíveis

```bash
npm run dev     # inicia o servidor de desenvolvimento
npm run build   # gera a versão de produção em dist/
npm run preview # visualiza localmente a versão de produção
npm run lint    # executa o ESLint
```

## Origem do projeto

O primeiro protótipo foi desenvolvido como trabalho final do curso **Programação Frontend com React e JavaScript**, do Instituto Federal de Santa Catarina (IFSC), com carga horária de 60 horas. A versão atual amplia o projeto acadêmico como uma demonstração de produto para o portfólio da Alves Tech.

## Autor

**Réges Alves**

[LinkedIn](https://linkedin.com/in/regesalves)
