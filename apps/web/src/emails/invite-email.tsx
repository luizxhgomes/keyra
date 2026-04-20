import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

export type InviteEmailProps = {
  orgName: string;
  inviterName: string;
  role: 'owner' | 'admin' | 'professional' | 'viewer';
  inviteUrl: string;
  expiresInHours: number;
};

const ROLE_LABEL: Record<InviteEmailProps['role'], string> = {
  owner: 'proprietário(a)',
  admin: 'administrador(a)',
  professional: 'profissional',
  viewer: 'espectador(a)',
};

/**
 * Email transacional de convite — KEYRA Story 1.3.
 * Disparado por `sendEmail` (ADR-021) quando um owner/admin convida alguém
 * para a organização.
 */
export function InviteEmail(props: InviteEmailProps) {
  const { orgName, inviterName, role, inviteUrl, expiresInHours } = props;
  const roleLabel = ROLE_LABEL[role];

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>
        {`${inviterName} convidou você para ${orgName} como ${roleLabel} no KEYRA.`}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Você foi convidado(a) para o KEYRA</Heading>

          <Text style={paragraphStyle}>
            <strong>{inviterName}</strong> convidou você para fazer parte da organização{' '}
            <strong>{orgName}</strong> como <strong>{roleLabel}</strong>.
          </Text>

          <Text style={paragraphStyle}>
            Clique no botão abaixo para aceitar o convite. Se você ainda não tiver uma
            conta KEYRA, conseguirá criar uma durante o processo.
          </Text>

          <Section style={buttonSectionStyle}>
            <Button href={inviteUrl} style={buttonStyle}>
              Aceitar convite
            </Button>
          </Section>

          <Text style={paragraphStyle}>
            Ou copie o link a seguir no seu navegador:
          </Text>
          <Text style={linkStyle}>{inviteUrl}</Text>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            Este convite expira em {expiresInHours} horas. Se você não esperava receber
            este email, pode ignorá-lo com segurança — nenhuma conta será criada.
          </Text>
          <Text style={footerStyle}>
            KEYRA · financeiro operacional para estética
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: '#f7f4ef',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const containerStyle = {
  maxWidth: '560px',
  margin: '32px auto',
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const headingStyle = {
  fontSize: '22px',
  color: '#3a2820',
  margin: '0 0 16px 0',
};

const paragraphStyle = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#3a2820',
  margin: '0 0 16px 0',
};

const buttonSectionStyle = {
  margin: '24px 0',
  textAlign: 'center' as const,
};

const buttonStyle = {
  backgroundColor: '#b5563f',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '600',
  display: 'inline-block',
};

const linkStyle = {
  fontSize: '13px',
  color: '#8a5d3b',
  wordBreak: 'break-all' as const,
  margin: '0 0 16px 0',
};

const hrStyle = {
  borderColor: '#e8dfd4',
  margin: '24px 0',
};

const footerStyle = {
  fontSize: '12px',
  color: '#8a7f74',
  lineHeight: '18px',
  margin: '0 0 8px 0',
};
