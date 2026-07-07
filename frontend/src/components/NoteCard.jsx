function NoteCard({ note }) {

    return (
        <div>

            <h3>{note.title}</h3>

            <p>{note.content}</p>

            <hr />

        </div>
    );
}

export default NoteCard;