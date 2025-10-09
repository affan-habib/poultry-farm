import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageHeaderProps {
  title: string
  description: string
  buttonText?: string
  buttonHref?: string
  onButtonClick?: () => void
}

export default function PageHeader({
  title,
  description,
  buttonText,
  buttonHref,
  onButtonClick,
}: PageHeaderProps) {
  const renderButton = () => {
    if (!buttonText) return null

    if (onButtonClick) {
      return <Button onClick={onButtonClick}>{buttonText}</Button>
    }

    if (buttonHref) {
      return (
        <Button asChild>
          <Link href={buttonHref}>{buttonText}</Link>
        </Button>
      )
    }

    return null
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {renderButton()}
    </div>
  )
}