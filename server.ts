import express, { Request, Response } from 'express'; // Import types for Request and Response
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { supabase } from './lib/supabase';

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/api/download', async (req: Request, res: Response): Promise<any> => {
  const token = req.query.token as string;

  if (!token) {
    return res.status(400).send('Invalid token');
  }/*else{
    return res.status(400).send(token);
  }*/

  try {
    // 📌 Check if the token exists and is not used
    const { data: download, error: fetchError } = await supabase
      .from('downloads')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (fetchError || !download) {
      return res.status(400).send('Invalid or expired download link');
    }

    // 📌 Serve the file
    const filePath = path.join(__dirname, '../public/assets/Finziai-Habbits-to-save-money-effortlessly.pdf');
    res.download(filePath, 'financial-freedom-ebook.pdf', async (err) => {
      if (err) {
        console.error('File download error:', err);
        return res.status(400).send("We are having an issue we will soon repair it! Thank you for your patience");
      }

      // 📌 After file is successfully sent, mark the token as used
      const { error: updateError } = await supabase
        .from('downloads')
        .update({ used: true })
        .eq('token', token);

      if (updateError) {
        console.error('Error updating token status:', updateError);
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('An error occurred during download');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
