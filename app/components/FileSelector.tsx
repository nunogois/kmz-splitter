import { forwardRef } from 'react'

const defaultStyle =
  'cursor-pointer text-center bg-emerald-700 text-white font-bold py-2 px-4 rounded outline-black hover:bg-emerald-800 duration-200'
const disabledStyle =
  defaultStyle + ' opacity-70 cursor-not-allowed hover:bg-emerald-500'

interface IFileUploaderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  extensions?: string[]
  children: React.ReactNode
}

export const FileSelector = forwardRef<HTMLInputElement, IFileUploaderProps>(
  ({ onChange, extensions, disabled, children, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
      if (e.key === 'Enter') {
        if (ref && 'current' in ref && ref.current) {
          ref.current.click()
        }
      }
    }

    return (
      <label
        className={disabled ? disabledStyle : defaultStyle}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <input
          type='file'
          ref={ref}
          onChange={onChange}
          accept={extensions?.join()}
          className='hidden'
          {...props}
        />
        {children}
      </label>
    )
  }
)
