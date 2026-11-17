import type { ReactNode } from 'react'
import { useStore } from '../context/StoreContext'
import { onlyDigits } from '../lib/format'
import { useSEO } from '../lib/hooks'

const UPDATED = '17 de novembro de 2026'

function Block({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="surface p-6 md:p-8">
      <h2 className="text-lg font-extrabold md:text-xl">{n}. {title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-txt/75">{children}</div>
    </section>
  )
}

const List = ({ items }: { items: ReactNode[] }) => <ul className="list-disc space-y-1.5 pl-5">{items.map((i, k) => <li key={k}>{i}</li>)}</ul>

export default function PrivacyPage() {
  useSEO('Política de Privacidade', 'Saiba como a JP STORE coleta, usa e protege seus dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD).')
  const { settings } = useStore()
  const wa = onlyDigits(settings.whatsapp_number)
  const ig = settings.instagram.replace('@', '')

  return (
    <div className="container-x max-w-3xl py-8 md:py-14">
      <h1 className="title text-4xl md:text-6xl">Política de Privacidade</h1>
      <p className="mt-3 text-sm text-sub">Última atualização: {UPDATED}</p>
      <p className="mt-4 text-txt/75">
        A <strong>JP STORE</strong> respeita a sua privacidade. Esta política explica, de forma simples, quais dados pessoais tratamos quando você usa
        este site, para que usamos, com quem compartilhamos e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <div className="mt-8 space-y-4">
        <Block n={1} title="Quem somos (controlador)">
          <p>A JP STORE é uma loja de moda masculina que vende pelo site e conclui os pedidos pelo WhatsApp. Ela é a responsável pelo tratamento dos dados descritos aqui.</p>
          <p>Canal de contato para assuntos de privacidade:{' '}
            {wa ? <a className="font-semibold underline" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp da loja</a> : 'WhatsApp da loja'}
            {settings.email && <>, e-mail <a className="font-semibold underline" href={`mailto:${settings.email}`}>{settings.email}</a></>}
            {ig && <>, ou Instagram <a className="font-semibold underline" href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">@{ig}</a></>}.
          </p>
        </Block>

        <Block n={2} title="Quais dados coletamos">
          <p>Só coletamos o necessário para atender o seu pedido:</p>
          <List items={[
            <><strong>Dados do pedido:</strong> nome completo, telefone/WhatsApp, cidade, bairro, endereço (quando a opção é entrega), forma de recebimento, observações e os produtos escolhidos (tamanho, cor, quantidade e valores).</>,
            <><strong>Sacola de compras:</strong> os itens que você adiciona ficam salvos apenas no seu próprio navegador (armazenamento local), para você não perder a sacola ao fechar a página.</>,
            <><strong>Dados técnicos:</strong> como em qualquer site, seu navegador envia informações como endereço IP e tipo de dispositivo aos servidores que entregam a página (hospedagem e fontes).</>,
            <><strong>Conta de administrador:</strong> e-mail e senha de quem gerencia a loja (não se aplica a clientes — não é preciso criar conta para comprar).</>,
          ]} />
          <p>Não coletamos dados de cartão, não processamos pagamentos no site e não pedimos documentos como CPF.</p>
        </Block>

        <Block n={3} title="Para que usamos seus dados">
          <List items={[
            'Montar o resumo do seu pedido e abrir a conversa com a loja pelo WhatsApp;',
            'Confirmar o pedido, combinar pagamento, entrega ou retirada e tirar dúvidas;',
            'Manter um registro do pedido para organização interna e atendimento pós-venda;',
            'Cumprir obrigações legais e proteger a loja contra fraudes e abusos.',
          ]} />
          <p>Não vendemos seus dados e não os usamos para perfis de publicidade.</p>
        </Block>

        <Block n={4} title="Base legal">
          <p>Tratamos os dados para a <strong>execução do pedido que você solicita</strong> (procedimentos preliminares e contrato), para <strong>cumprimento de obrigações legais</strong> e, quando necessário, com o seu <strong>consentimento</strong> — que é dado ao enviar o formulário de finalização.</p>
        </Block>

        <Block n={5} title="Com quem compartilhamos">
          <p>Usamos prestadores de serviço que processam dados em nosso nome:</p>
          <List items={[
            <><strong>WhatsApp (Meta):</strong> a mensagem do pedido é enviada por você ao WhatsApp da loja e segue as regras do próprio WhatsApp.</>,
            <><strong>Supabase:</strong> banco de dados e armazenamento de imagens, onde ficam o catálogo e o registro dos pedidos, com acesso restrito a administradores.</>,
            <><strong>Vercel:</strong> hospedagem do site.</>,
            <><strong>Google Fonts:</strong> fornece as fontes de texto do site, o que pode expor seu endereço IP ao Google.</>,
          ]} />
          <p>Esses serviços podem armazenar dados em servidores fora do Brasil. Nesses casos, adotamos fornecedores que seguem padrões reconhecidos de segurança. Também podemos compartilhar dados quando a lei ou uma autoridade exigir.</p>
        </Block>

        <Block n={6} title="Cookies e armazenamento local">
          <p>Este site <strong>não usa cookies de publicidade nem ferramentas de rastreamento</strong>. Usamos apenas o armazenamento local do navegador para guardar a sua sacola e, para administradores, a sessão de login. Você pode apagar esses dados nas configurações do navegador a qualquer momento.</p>
          <p>Links para Instagram e WhatsApp levam a serviços de terceiros, com políticas próprias.</p>
        </Block>

        <Block n={7} title="Por quanto tempo guardamos">
          <p>Guardamos os dados dos pedidos pelo tempo necessário para o atendimento, a garantia e o cumprimento de obrigações legais e fiscais. Depois disso, eles são excluídos ou anonimizados. Você pode pedir a exclusão antes, quando a lei permitir.</p>
        </Block>

        <Block n={8} title="Seus direitos">
          <p>Pela LGPD, você pode solicitar, a qualquer momento:</p>
          <List items={[
            'confirmação de que tratamos seus dados e acesso a eles;',
            'correção de dados incompletos, incorretos ou desatualizados;',
            'anonimização, bloqueio ou exclusão de dados desnecessários ou tratados fora da lei;',
            'portabilidade dos dados, quando aplicável;',
            'informação sobre com quem compartilhamos seus dados;',
            'revogação do consentimento e oposição a tratamentos.',
          ]} />
          <p>Para exercer qualquer direito, fale com a gente pelos canais da seção 1. Respondemos em prazo razoável. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</p>
        </Block>

        <Block n={9} title="Segurança">
          <p>Adotamos medidas técnicas para proteger seus dados: conexão segura (HTTPS), controle de acesso por perfil no banco de dados (somente administradores autorizados veem pedidos) e armazenamento em provedores com padrões de segurança. Nenhum sistema é totalmente imune, mas trabalhamos para reduzir riscos.</p>
        </Block>

        <Block n={10} title="Crianças e adolescentes">
          <p>O site é voltado a maiores de idade. Menores de 18 anos devem comprar com o acompanhamento de um responsável.</p>
        </Block>

        <Block n={11} title="Mudanças nesta política">
          <p>Podemos atualizar esta política para refletir mudanças no site ou na lei. A data da última atualização fica sempre no topo desta página.</p>
        </Block>
      </div>
    </div>
  )
}
