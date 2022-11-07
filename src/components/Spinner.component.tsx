type SpinnerComponentProps = {
    show: boolean
}

export default function SpinnerComponent({ show }: SpinnerComponentProps) {
    return show ?
           <div className='loader'></div> :
           null
}