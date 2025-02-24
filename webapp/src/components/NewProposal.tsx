import { useState } from 'react'

function NewProposal() {
	const [file, setFile] = useState<File | null>(null)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0])
		}
	}

	const handleGenerateProposal = () => {
		if (!file) return	
		// TODO: transcribe if audio file
		// TODO: generate sales proposal
	}
	
	return (
		<div className="flex flex-col justify-center items-center w-full">
			<input 
				className="border-2 border-dashed border-neutral-500 p-16 m-2 text-neutral-800 file:bg-neutral-800 file:text-neutral-200 file:py-1 file:px-4 file:rounded" 
				type="file" 
				onChange={handleInputChange}
			/>
			{ file ? (
				<p className="flex justify-center items-center px-4 rounded h-8 bg-neutral-800 text-neutral-200">{file.name}</p>	
			) : (
				<p className="h-8"></p>
			)}
			<button
				className="bg-blue-600 text-neutral-50 p-2 m-8 rounded shadow-lg hover:cursor-pointer"
				onClick={handleGenerateProposal}
			>Generate proposal</button>
		</div>
	)
}

export default NewProposal
