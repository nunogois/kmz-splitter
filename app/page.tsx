'use client'

import { useRef, useState } from 'react'
import JSZip from 'jszip'
import { Builder, parseString } from 'xml2js'
import { FileSelector } from './components/FileSelector'

const Home = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const zip = new JSZip()
    const reader = new FileReader()

    reader.onload = async e => {
      setLoading(true)
      try {
        const kmzData = e.target?.result
        if (!kmzData) return

        const zipContent = await zip.loadAsync(kmzData as ArrayBuffer)
        const kmlFile = Object.keys(zipContent.files).find(filename =>
          filename.endsWith('.kml')
        )

        if (!kmlFile) {
          console.error('No KML file found in the KMZ archive.')
          return
        }

        const kmlContent = await zip.file(kmlFile)?.async('string')
        if (!kmlContent) {
          console.error('Unable to read the KML file.')
          return
        }

        const builder = new Builder()
        const outputZip = new JSZip()

        parseString(kmlContent, (_, result) => {
          for (let i = 1; i <= 100; i++) {
            const s = i < 10 ? 'S0' + i : `S${i}`
            const kml = {
              ...result.kml,
              Document: result.kml.Document?.map((document: any) => ({
                ...document,
                Folder: document.Folder?.map((folder: any) => ({
                  ...folder,
                  Placemark: folder.Placemark.filter((placemark: any) =>
                    placemark.name[0].includes(s)
                  )
                }))
              }))
            }

            const kmlString = builder.buildObject({ kml })
            outputZip.file(`${s}.kml`, kmlString)

            console.log(`${i}%`)
          }
        })

        const content = await outputZip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = `kmzsplitter_${
          new Date().toISOString().split('T')[0]
        }.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        if (error instanceof ErrorEvent) {
          setError(error.message)
        }
        console.error(error)
      } finally {
        setLoading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <div className='h-full flex flex-col justify-center items-center m-8'>
      <h1 className='text-4xl font-bold mb-4 tracking-wider'>KMZ Splitter</h1>
      <h2 className='text-lg mb-8'>
        Split a KMZ file into multiple smaller KML files.
      </h2>
      <FileSelector
        ref={fileInputRef}
        onChange={handleFileChange}
        extensions={['.kmz']}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Select KMZ file'}
      </FileSelector>
      {error && (
        <div className='text-red-500 text-sm mt-8'>
          Error: {error}. Check the console for more details.
        </div>
      )}
      <p className='text-xs opacity-70 mt-8'>
        The processing happens locally on your browser, so your data is safe and
        never stored.
      </p>
      <p className='text-xs opacity-70'>
        The current process is limited to a specific use case. If you'd like to
        adapt it to your needs, feel free to check out the source code on{' '}
        <a
          href='https://github.com/nunogois/kmz-splitter'
          target='_blank'
          className='text-emerald-800 dark:text-emerald-300 hover:underline'
        >
          GitHub
        </a>
        .
      </p>
      <p className='text-xs mt-4 text-emerald-800 dark:text-emerald-300'>
        v{process.env.VERSION}
      </p>
    </div>
  )
}

export default Home
